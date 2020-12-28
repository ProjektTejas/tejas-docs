# Backend

For the backend we are going to use FastAPI+Celery+PyTorch and it'll be hosted by AWS Lambda, one sure issue in this is that AWS Lambda has a limit of 500MB uncompressed requirements file, so we are goint to use EFS (Amazon Elastic File System) that gives 5GB in free tier to host our dependencies, so in theory we'll be able to install PyTorch 1.7.0 latest, and all the good dependencies needed, and this can be shared among any Lambda that requires it.

Another benefit of this is that the remaining 500MB can be used to temporarily store the models, which will be sent to the user over the socket connection, if it doesn't work we might need to use S3 buckets.

[28-12-20]

- I need to setup EFS, and then connect that EFS storage to an EC2 instance, then install all the dependencies, and copy them to the EFS, now i can simply mount this EFS on lambda and set the PYTHON environment to point to `/mnt/efs/lib/python3.8/site-packages` and lambda will pickup everything!
- or well, that's the plan atleast
- https://stackoverflow.com/questions/62935465/how-to-install-large-dependencies-on-aws-efs-via-serverless-framework
- https://lumigo.io/blog/unlocking-more-serverless-use-cases-with-efs-and-lambda/
- This is really nice !: https://aws.amazon.com/blogs/aws/new-a-shared-file-system-for-your-lambda-functions/
