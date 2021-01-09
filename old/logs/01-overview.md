# Overview

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
