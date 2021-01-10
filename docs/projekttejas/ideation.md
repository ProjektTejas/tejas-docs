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
- `AWS EFS`: to store the Lambda python requirements, and also the models
- `AWS S3`: to store dataset
- `PyTorch`: to train models

I also used DynamoDB to store the training status and S3 to store the datasets.

I had planned to do Text Classification as well, but wasn't able to finish it up by time, although there isnt much change in the pipeline, i had done it before in [Neural Word Embedding - Text Classification](https://github.com/satyajitghana/TSAI-DeepVision-EVA4.0-Phase-2/tree/master/09-NeuralWordEmbedding), so yeah. If i get time i would definitely add Text Classification to this Project.

Why use EFS you ask ? because AWS Lambda gives you only 500MB of storage, which doesn't fit our requirements, PyTorch 1.7.0 + Torchvision themselves exceed the limit, using EFS i can easily share dependencies betweem lambdas, and also get 5GB of free storage.

You can read more about the Plan in [New Plan](../logs/new-plan.md)
