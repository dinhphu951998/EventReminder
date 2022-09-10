
# Event Reminder


# Functionality of the application

This application will allow creating/removing/updating/fetching Event items. Each event item can optionally have an attachment image. Each user only has access to event items that he/she has created.

When the event start date comes, there is an email to notify him/her.

## Event items

The application stores event items, and each event item contains the following fields:

* `id` (string) - a unique id for an item
* `title` (string) - title of an event item (e.g. "Udacity welcome event")
* `startDate` (string) - date by which an event starts (format: YYYY-MM-DD)
* `note` (string) - description/note that users want to store
* `imageUrl` (string) (optional) - a URL pointing to an image attached to an event

## Tech stack

* <a href="https://manage.auth0.com/" target="_blank">Auth0</a>
* <a href="https://reactjs.org/" target="_blank">ReactJS</a>
* <a href="https://nodejs.org/en/download/package-manager/" target="_blank">NodeJS</a>
* <a href="https://www.serverless.com/" target="_blank">Serverless</a>
* <a href="https://aws.amazon.com/" target="_blank">Amazon Web Service</a>
   
## Architecture
![Overall Architecture](images/Architecture_Overall.png?raw=true)

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application, first, edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the application.