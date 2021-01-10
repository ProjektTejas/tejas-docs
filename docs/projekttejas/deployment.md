---
id: deployment
title: Deployment
sidebar_label: Deployment
---

To deploy the model, i used Serverless, which is a nice framework that does most of your tasks like CLoudFormation, Stack, and other resources needed for your serverless application.

If you like you can look at [tejas-ml-service serverless.yml](https://github.com/ProjektTejas/tejas-ml-service/blob/master/serverless.yml) and [tejas-service serverless.yml](https://github.com/ProjektTejas/tejas-service/blob/master/serverless.yml)

You can see the [Architecure](architecture.md) of how all the components work together in AWS.

For the FrontEnd since i used Next.JS it was just straight forward, i used Vercel and connceted my repository and voila, its deployed.

## Learning

- One major issue i faced is that since i placed my Lambda in a VPC, and i wanted to call one lambda from another i had to configure a VPC Endpoint Interface, for which i was billed $10 or so, or Rs 800, i wasn't aware of this
- To solve this i simply chucked the idea of calling lambda from lambda, and instead simply triggered the training lambda from an S3 Event.
