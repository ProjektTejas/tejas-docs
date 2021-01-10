---
id: old-plan
title: Old Plan
sidebar_label: Old Plan
---

## Ideation

The plan for ProjektTejas which will be a automated Deep Learning application, which ingests images with their class labels and spits out model that can classify those images and any new images given to it.

The techstack is to make a microservices application in docker, that can be easily deployed in AWS !

- `FastAPI`: really good and well documented async server
- `Celery`: for creating task queues, that will pre process images, and build the models
- `AWS Lambda`: to process the requests, and push tasks to celery

The plan is to have online/offline learning, i.e. offline learning will be a PWA in which ONNX models will be trained in-browser, while the online version will use our backend to process the images and create models, and send it back to the server.

I'll need to find Redis and RabbitMQ brokers deployed somewhere, or maybe use AWS SQS and DynamoDB.

## Overview

- What all do i need for Celery
  - [https://docs.celeryproject.org/en/stable/getting-started/introduction.html#what-do-i-need](https://docs.celeryproject.org/en/stable/getting-started/introduction.html#what-do-i-need)
  - Amazon SQS
    - 1 Million Requests in total for free
  - Amazon Dynamo DB
    - 25 GB free tier
- The backend will be hosted using AWS Lambda, since its free
- FastAPI will be used for microservices
  - [https://fastapi.tiangolo.com/tutorial/bigger-applications/](https://fastapi.tiangolo.com/tutorial/bigger-applications/)

---

## The Plan

1. Users will upload their images with the labels
2. The browser will process these images and create a nice zip file out of it
   1. basically the `ImageFolder` format: [https://pytorch.org/docs/stable/torchvision/datasets.html#imagefolder](https://pytorch.org/docs/stable/torchvision/datasets.html#imagefolder)
3. This zip file will be sent over to AWS Lambda Function (which will obviously be needed to be awoken) via a socket connection. AWS Gateway now supports socket connections so yayyy
   1. be careful about the packet size, since its limited by the Amazon Gateway
4. Once the zip file is received, it is then used by a PyTorch Lightning Module to train ResNet18 over the image folder and spit out a model file
   1. while doing this make sure to send progress via the socket
   2. Celery task will be initiated that is responsible to train the network and give back the saved model file
5. The model would be a ONNX model, which will then be used by the browser to make inferences and classify the images in the browser.
   1. Look into how ONNX can be made for Text Classification Models
   2. we'll also give an option to get the pytorch model if needed
6. All the data in S3 and Lambda will be deleted after sometime, so once its sent back to browser, its browser's responsibility to show the download links for it.

---

### Note

Keep the architecture style to microservices, so we can scale up this application easily.

---

## Additional Feature (I might implement this first)

- Offline mode, basically a PWA (Progressice Web App) that will train and inference all in-browser, no backend servers involved at all !
