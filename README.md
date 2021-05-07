# Vaccinosaurus

![Deployed on Heroku](https://img.shields.io/badge/Website-Deployed%20On%20Heroku-6567a5) ![GitHub deployments](https://img.shields.io/github/deployments/luciferreeves/vaccinosaurus/vaccinosaurus?label=Deployment%20State) ![GitHub Repo stars](https://img.shields.io/github/stars/luciferreeves/vaccinosaurus?label=Stars)

You can visit Vaccinosaurus by clicking [this link](https://vaccinosaurus.herokuapp.com/). Vaccinosaurus only works in India.

## What is Vaccinosaurus?

Vaccinosaurus is a COVID-19 vaccine availability tracker and notifier. This website can tell you about available vaccination centers and available slots in your area as well as it can notify you if a slot is available in the near future. 

## Why Vaccinosaurus?

Why is it called Vaccinosaurus? For one, dinosaurs are were cool! And two, there was an utter shortage of cool unique names. So, here we are, T-Rex!

## How do I get notified?

Vaccinosaurus saves your information like your vaccine choice, age, PIN code, district and notifies you via email whenever a slot is available for you in your nearest vaccination center.

## You save data?

Don't worry about the data as Vaccinosaurus is not Facebook! If you are still thinking that your data is at risk, literally the whole code is made available on GitHub for your keen inspection.

## Cool, what database do you use?

Vaccinosaurus uses Firestore for quick and realtime updates. Behind the scenes, Vaccinosaurus runs a cron job every minute to collect information about the available vaccines. Here is the current security rule of Vaccinosaurus for Firestore:

````
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
````

The above security rule will allow read and write access to only authenticated users.

**_PLEASE STAR THE REPOSITORY IF YOU LIKE VACCINOSAURUS_**

LICENSED UNDER THE MIT LICENSE
