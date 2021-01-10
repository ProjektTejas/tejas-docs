---
title: Working with Large Dependencies (≥500MB) with AWS Lambda and EFS (Amazon Elastic File System)
author: Satyajit Ghana
author_title: DL Engineer
author_url: https://github.com/satyajitghana
author_image_url: https://avatars2.githubusercontent.com/u/8092481?s=460&u=bc925e234688ba256e7038594a8197632d0c8a1b&v=4
tags: [aws, lambda, efs]
description: Working with Large Dependencies (≥500MB) with AWS Lambda and EFS (Amazon Elastic File System)
image: https://i.imgur.com/mErPwqL.png
hide_table_of_contents: false
---

This story begins with a lot of hard work put into deploying ML models into AWS Lambda and exhausting my entire free S3 Quota. I’ve built backends with AWS Lambda and Serverless framework, it makes it really easy to build and deploy model backends. But . . . continue reading . . .

## What is the storage issue with Lambda ?

All of my backends are dependent on PyTorch and Torchvision, all deployments were fine until PyTorch 1.6.0 arrived, this exhausted my lambda storage, you get 500MB (uncompressed requirements) of storage in /tmp directory of lambda, and serverless python requirements also reside in that directory. and PyTorch 1.6.0 exceeded that. I had no other way to make it work, other than moving to Heroku, which solved all my problems !! Heroku has a “compressed requirements” slug limit of 500MB, and GBs of temporary storage, ofcourse that means when the system goes to down state all of the temp storage is released, but I had no state ! all I needed was for my dependencies to work.

Another huge issue was that I couldn’t bundle OpenCV, PyTorch and ScaPy models in the same Lambda due to the 500MB dependencies limit, I had to make different lambdas for different parts of the preprocessing and inferencing.

And on top of all this issues, I exhausted my S3 Quota 😕, what a bummer. It turns out serverless uploads to S3 and then deploys the Lambda, and it also keeps last 5 deployments, so like 1.2GB of space per lambda in S3, and for the free tier I get a max of 5GB, of-course it had to exhaust, in my experimentation phase I push about 4–5 times at-least to get the backend to work.

## What’s the solution ?

I searched a lot for a good fitting solution, to solve my storage issue exhaustion, and also my deployment times, it took a lot of time just on deployment, since I always had to upload the 250MB slug to S3 and deploy every single time I changed something in my backend.

The deployment time can be solved easily by using Lambda Layers, which is a wonderful concept! it lets you create different layers with different dependencies, and you can simply always update your backend function without needing to change the layers, the layers are responsible to handle the dependencies, but . . . this DOES NOT solve my 500MB limit, all of the layers combined can have a total storage of 500MB, this means I can’t use the latest PyTorch 1.7.1, bummer . . .😖😕

## Then comes EFS (Amazon Elastic File System)

Finally after discovering that EFS works with Lambda out-of-the-box I had to try this out, was it true ? could I use PyTorch+OpenCV+SpaCy+MyModels all on a single Lambda ?

yeah yeah read on . . .

I’ll be using Serverless framework to deploy my backend, since it makes it really easy to setup everything, I don’t have to do much work setting up the API Gateway and stuff.

More about EFS here: [https://docs.aws.amazon.com/efs/latest/ug/how-it-works.html](https://docs.aws.amazon.com/efs/latest/ug/how-it-works.html)

![EFS FileSystem](https://cdn-images-1.medium.com/max/2000/0*OlCdzphjNgFb-mUZ.png)*EFS FileSystem*

### Let’s create an EFS instance !

Go to your AWS Console -> EFS -> Create File System

(remember the VPC being used here)

![](https://cdn-images-1.medium.com/max/2000/1*yvEH3AZyDvmHZ4qnlkz-yA.png)

Now go ahead and create an “Access Point” for this EFS

![](https://cdn-images-1.medium.com/max/2000/1*oLYb5r94SA1jSEAvw1tGvQ.png)

![](https://cdn-images-1.medium.com/max/2000/1*PHUJyZmwyARhjAubaJS2lw.png)

![](https://cdn-images-1.medium.com/max/2000/1*91pmwSRGnBXOey5F5kIO7A.png)

The above just means that this Access Point has full access to the EFS

Now we have to somehow copy our dependencies into this newly created EFS

To make sure that our dependencies will definitely work with lambda, we’ll lambda’s docker image to get the dependencies first.

I built my docker image, mounted a folder, and installed the packages into that folder,

Here’s my Dockerfile

    # since this will be deployed to lambda
    FROM lambci/lambda:build-python3.8

    # this is just for local testing
    RUN pip install uvicorn
    EXPOSE 8000

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install -r requirements.txt

    COPY . .

    ENTRYPOINT [ "uvicorn", "tejas.main:app", "--host", "0.0.0.0", "--port", "8000"]

Above basically is installing all dependencies and copying my code into the image, nothing fancy

I built the image with docker build -t tejas .

and ran it with mounting the empty requirements folder into the container

    docker run -it --rm -v $(pwd)/requirements:/app/requirements --entrypoint /bin/bash tejas

Then installed requirements into the requirements folder

    pip install -r requirements.txt -t requirements

-t option for pip tells it to install the collected requirements in that given folder

![Installing the requirements in the requirements folder mounted into docker container](https://cdn-images-1.medium.com/max/3276/1*iVVeTpdiLZsQxELrtUGJKg.png)*Installing the requirements in the requirements folder mounted into docker container*

![These are all the requirements copied to our host machine from the docker container](https://cdn-images-1.medium.com/max/3276/1*uGbIaD9-4e_Pv1Ftt-e38Q.png)*These are all the requirements copied to our host machine from the docker container*

## It’s EC2 Time

Now we need to spin and EC2 instance and copy these requirements to EC2 first, so go to your EC2 Dashboard, select a simple Ubuntu server and start it.

![EC2 selection](https://cdn-images-1.medium.com/max/3298/1*5HWq9BVlfJ8pH_3mP0t1Jw.png)*EC2 selection*

But you wont be able to mount your EFS, yet . . . to do that, go to the Security Groups and add an Inbound Connection to the SG associated with your EFS’s VPC, to allow EC2 to mount NFS over this VPC.

![Allowing NFS Inbound rule into EFS’s default VPS’s Security Group](https://cdn-images-1.medium.com/max/3416/1*meUz1IMAzIZdngGkdwlaeQ.png)*Allowing NFS Inbound rule into EFS’s default VPS’s Security Group*

When choosing the SG here, select the SG of your newly created EC2, which should probably come as launch-wizard-x.

Now lets connect to our EC2 and mount this EFS, go to your EC2 instance and click on CONNECT, you’ll get something like

![Command to SSH into EC2](https://cdn-images-1.medium.com/max/2000/1*FAR87zM1kRhCkG0FC5cdEA.png)*Command to SSH into EC2*

Now you can use your pem file and above command to connect to EC2

![](https://cdn-images-1.medium.com/max/3298/1*hxi3IJwanKWDlt57EzpXnw.png)

To mount EFS volume, go to your EFS instance, and then click on ATTACH, you’ll get something like

![Command to mount EFS](https://cdn-images-1.medium.com/max/3504/1*Jck0Kd0H-tS8Tlveo85YIg.png)*Command to mount EFS*

Copy the “Using the NFS Client” command,

Run this in your EC2 to install the NFS Utilities:

sudo apt install nfs-common

and make an efs directory

mkdir efs

Now you can mount your NFS !

    sudo mount -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport fs-xxxxxx.efs.ap-south-1.amazonaws.com:/ efs

If you do a quick df -h you’ll see that your EFS is now mounted

![EFS mounted into EC2](https://cdn-images-1.medium.com/max/2000/1*4GHhhSjfdgbepLFIpd5yKA.png)*EFS mounted into EC2*

I had ran into timeout errors because my SG weren’t right, the above steps shouldn’t cause any issues, if you aren’t able to mount then look into: [https://docs.aws.amazon.com/efs/latest/ug/troubleshooting-efs-mounting.html#mount-hangs-fails-timeout](https://docs.aws.amazon.com/efs/latest/ug/troubleshooting-efs-mounting.html#mount-hangs-fails-timeout)

Now we can copy over our requirements to this EFS, I’ll use scp for that

![Copying Requirements from local machine to EC2 via SCP](https://cdn-images-1.medium.com/max/2718/1*ch4Jz2zfq85SIo4myHchoQ.png)*Copying Requirements from local machine to EC2 via SCP*

    scp -i "satyajit.pem" -r /mnt/d/Projects/ProjektTejas/tejas-service/requirements/ ubuntu@ec2-xx-xx-xx-xx.ap-south-1.compute.amazona
    ws.com:/home/ubuntu/

Now simply copy over the requirements to the EFS

![Requirements copied to EFS via EC2](https://cdn-images-1.medium.com/max/3256/1*7zSklmSrQcZPMDveDKHCjw.png)*Requirements copied to EFS via EC2*

Isn’t this just amazing !!!!! You get 5 GB for free EFS storage, and you can use multiple lambdas with the same dependencies! and as soon as I update the EFS files, all the lambdas quickly pickup the new dependencies on new invocation !

![EFS Total Size](https://cdn-images-1.medium.com/max/3126/1*6M1gJcQPBWBxpTkxsGwMrQ.png)*EFS Total Size*

As you can see above all the dependencies in total are 854 MiB, and Lambda works with all of them ! damn right ?

Here’s my requirements.txt

    [https://download.pytorch.org/whl/cpu/torch-1.7.1%2Bcpu-cp38-cp38-linux_x86_64.whl](https://download.pytorch.org/whl/cpu/torch-1.7.1%2Bcpu-cp38-cp38-linux_x86_64.whl)
    [https://download.pytorch.org/whl/cpu/torchvision-0.8.2%2Bcpu-cp38-cp38-linux_x86_64.whl](https://download.pytorch.org/whl/cpu/torchvision-0.8.2%2Bcpu-cp38-cp38-linux_x86_64.whl)
    fastapi==0.63.0
    mangum==0.10.0
    loguru==0.5.3
    boto3==1.16.47
    python-multipart==0.0.5

There are some drawbacks though

As you have large dependencies and you’ll be reading those files every time your Lambda starts up, it’ll cost you Read Operations, and EFS has a different way of billing you for it.

Also if multiple lambdas are using the common EFS for dependencies, and you decide to update it someday, you might break some of your lambdas as they might be holding on to some specific dependency versions. Well but i dont think its really an issue, I like to live on the edge 😂😂 bring in all the updated dependencies.

You’ll lose Internet access in Lambda, since you are on a VPC, but that can be solved easily: [https://stackoverflow.com/questions/62240023/aws-lambda-function-cant-invoke-another-lambda-function-in-the-same-vpc/65541460#65541460](https://stackoverflow.com/questions/62240023/aws-lambda-function-cant-invoke-another-lambda-function-in-the-same-vpc/65541460#65541460)

## Deploying Serverless with EFS attached

Now I’ll deploy the serverless application 😁

![](https://cdn-images-1.medium.com/max/2422/1*lMFcl5Eat0hPhxHRkYbE8Q.png)

### Look at that cute little zip file 😵😚😍 of just 9.02 KB ! awww, compared to 200–240 MB of zips being uploaded on every deployment, that’s quite an improvement, isn’t it ?

My original plan was to use this Lambda to train a Deep Learning model, and I was successful !! (BTW this is one Lambda calling another Lambda to train the model, and both of them share the same EFS)

![CloudLogs for Model Training](https://cdn-images-1.medium.com/max/2596/1*vD22NlucFBppXFo_k6bILA.png)*CloudLogs for Model Training*

Here’s my serverless.yml

```yaml
service: tejas-service
org: tensorclan

frameworkVersion: '2'

provider:
  name: aws
  runtime: python3.8
  stage: dev
  region: ap-south-1
  timeout: 60
  environment:
    PRODUCTION: TRUE
  iamRoleStatements:
    - Effect: Allow
      Action:
        - lambda:InvokeFunction
      Resource: "*"
  apiGateway:
    shouldStartNameWithService: true
    binaryMediaTypes:
      - "multipart/form-data"
      - "*/*"

functions:
  tejas:
    handler: tejas.handler
    memorySize: 704
    events:
      - http:
          method: ANY
          path: /
      - http:
          method: ANY
          path: /{proxy+}
    fileSystemConfig:
      localMountPath: /mnt/tejas-fs
      arn: arn:aws:elasticfilesystem:ap-south-1:12345678900:access-point/fsap-0abcdefghijklmnop
    vpc:
      securityGroupIds:
        - sg-abc
      subnetIds:
        - subnet-123
        - subnet-456
        - subnet-789
    environment:
      TEJAS_LAMBDA: true
      TEJAS_LIBS_PATH: /mnt/tejas-fs/tejas-libs

package:
  exclude:
    - requirements/
    - requirements/**
```

This is an amazing blog on how to use EFS with Lambda : [https://aws.amazon.com/blogs/compute/using-amazon-efs-for-aws-lambda-in-your-serverless-applications/](https://aws.amazon.com/blogs/compute/using-amazon-efs-for-aws-lambda-in-your-serverless-applications/)

Some interesting links:

* [https://stackoverflow.com/questions/62240023/aws-lambda-function-cant-invoke-another-lambda-function-in-the-same-vpc/65541460#65541460](https://stackoverflow.com/questions/62240023/aws-lambda-function-cant-invoke-another-lambda-function-in-the-same-vpc/65541460#65541460)

* [https://docs.aws.amazon.com/efs/latest/ug/wt1-test.html](https://docs.aws.amazon.com/efs/latest/ug/wt1-test.html)

* [https://docs.aws.amazon.com/lambda/latest/dg/services-efs.html](https://docs.aws.amazon.com/lambda/latest/dg/services-efs.html)

* [https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html](https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html)
