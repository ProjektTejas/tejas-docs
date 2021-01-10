---
id: log-frontend
title: Frontend
sidebar_label: Frontend
---

I chose to use Next.JS for this, along with AntD as the design principle

Date: `27-12-20`

- finished the dataset explorer part
- the user can now upload a dataset, and view the images
- the dataset can also be exported to a zip file, this zip file will be directly sent to lambda, and not its lambda's headache to train the model on that and return the trained model ONNX file

Date: `01-01-21`

- WebSockets did not work as i expected, and moreover 6MB is the file size limit, so i cannot use REST API /  Web Sockets to transfer the model. Instead i am sticking with creating S3 download urls to download the trained model
- I was able to finish the Folder Upload and Dataset Explorer using Virtual File System and Chocky V2
- I finished the Uploading dataset to backend and wrote all the neccesary functions to check status of model, downloading model, etc.

Date: `10-01-21`

- My Exams are over and i've almost finished up, documenting everything now
- To fix the cold start problem, i simply added a get request call on every website refresh, this will keep the lambda awake, also since the lambda is only about 16KB it doesnt take much time to wakeup
