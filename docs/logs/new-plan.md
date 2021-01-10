---
id: new-plan
title: New Plan
sidebar_label: New Plan
---

## Ideation

I had initally thought of using Celery, and some sort of Messaging service to train the models, but it turns out i cannot use Celery with Lambda, it's just too much of stuff to work, also `/dev/shm` is not available in Lambda, i.e. IPC and Shared Process Memory is not there, so i cannot Celery and multiple workers.

My New Plan is to Use Another Lambda that is specfic to train Models. That's its only Job.

My New Tech Stack

- `FastAPI`: Handling REST API
- `Lambda`: for hosting End Points, Training the Model
- `DynamoDB`: for keeping track of the model training status
- `S3`: for storing the dataset
- `EFS`: for storing models, and python requirements

## The Plan

1. The user comes to the website, uploads the entire dataset folder, we use the `ImageDataset` format from `PyTorch`
2. Now we resize the Images to `224x224` and create a zip file
3. Upload the zip file to API Backend, which creates the training task in DynamoDB
4. Then the Backend uploads the file to S3, which triggers the training Lambda
5. Training Lambda unzips the dataset and starts training on it, and also updates the training status of the model in the DB
6. The User's Browser continuously probes for the model status every 30 seconds or so.
7. Once the model train task status is COMPLETED, then the user can proceed to inferencing
8. The taskId input is prefilled for the user, the user simply uploads a new image
9. This image is sent to api backend, which figures out the model from the task id, loads the model, does inferencing and returns the results.
10. The user can now proceed to download the model, which includes the class map json file and traced model.

One missing thing in my new plan is that, i had initially planned to do text classification and image classification, but due to my exams and other commitments, wasn't able to do the text classification, but it isn't that different from my current flow, just the model is changed, and instead of folder upload, we have to ask the user for a CSV file, everything else in our pipeline would be same.
