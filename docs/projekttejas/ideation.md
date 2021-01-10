---
id: ideation
title: Ideation
sidebar_label: Ideation
slug: /ideation
---

The plan for ProjektTejas which will be a automated Deep Learning application, which ingests images with their class labels and spits out model that can classify those images and any new images given to it.

The techstack is to make a microservices application in docker, that can be easily deployed in AWS !

After a lot of work i finally settled on

- `FastAPI`: really good and well documented async server
- `AWS Lambda`: to process the API Requests, and Train models from S3
- `AWS EFS`: to store the Lambda python requirements
- `PyTorch 1.7.0`: to train models

I also used DynamoDB to store the training status and S3 to store the datasets.
