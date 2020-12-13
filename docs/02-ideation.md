# Ideation

The plan for ProjektTejas which will be a automated Deep Learning application, which ingests images with their class labels and spits out model that can classify those images and any new images given to it.

The techstack is to make a microservices application in docker, that can be easily deployed in AWS !

- `FastAPI`: really good and well documented async server
- `Celery`: for creating task queues, that will pre process images, and build the models
- `AWS Lambda`: to process the requests, and push tasks to celery

The plan is to have online/offline learning, i.e. offline learning will be a PWA in which ONNX models will be trained in-browser, while the online version will use our backend to process the images and create models, and send it back to the server.

I'll need to find Redis and RabbitMQ brokers deployed somewhere, or maybe use AWS SQS and DynamoDB.
