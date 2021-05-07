# Vaccinosaurus

![Deployed on Heroku](https://img.shields.io/badge/Website-Deployed%20On%20Heroku-6567a5) ![GitHub deployments](https://img.shields.io/github/deployments/luciferreeves/vaccinosaurus/vaccinosaurus?label=Deployment%20State) ![GitHub Repo stars](https://img.shields.io/github/stars/luciferreeves/vaccinosaurus?label=Stars)

You can visit Vaccinosaurus by clicking [this link](https://vaccinosaurus.herokuapp.com/). Vaccinosaurus only works in India.

- [Vaccinosaurus](#vaccinosaurus)
  * [What is Vaccinosaurus?](#what-is-vaccinosaurus-)
    + [Why Vaccinosaurus?](#why-vaccinosaurus-)
    + [How do I get notified?](#how-do-i-get-notified-)
    + [You save data?](#you-save-data-)
    + [Cool, what database do you use?](#cool--what-database-do-you-use-)
  * [Local Development](#local-development)
  * [Issues and Pull Requests](#issues-and-pull-requests)
  * [License](#license)

## What is Vaccinosaurus?

Vaccinosaurus is a COVID-19 vaccine availability tracker and notifier. This website can tell you about available vaccination centers and available slots in your area as well as it can notify you if a slot is available in the near future. 

### Why Vaccinosaurus?

Why is it called Vaccinosaurus? For one, dinosaurs ~~are~~ were cool! And two, there was an utter shortage of cool unique names. So, here we are, T-Rex!

### How do I get notified?

Vaccinosaurus saves your information like your vaccine choice, age, PIN code, district and notifies you via email whenever a slot is available for you in your nearest vaccination center.

### You save data?

Don't worry about the data as Vaccinosaurus is not Facebook! If you are still thinking that your data is at risk, literally the whole code is made available on GitHub for your keen inspection.

### Cool, what database do you use?

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

## Local Development

[Fork](https://github.com/luciferreeves/vaccinosaurus/fork) the repository and clone it to your local machine. cd into the folder and install the dependencies:

````
cd vaccinosaurus && npm install
````

Finally start the server:

````
npm start
````

You will need to add a `.env` file to the root of the vaccinosaurus folder in order to run admin functions. If you're planning to use your own firebase credentials then please replace the credentials found in: [public/js/auth.js](./public/js/auth.js) file.

In order to generate Firebase admin SDK credentials go to https://firebase.google.com/docs/admin/setup or click https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk to go to the service accounts page directly. Click on **Create Service Account** and then click on **Generate new private key** as shown below:

![Firebase Add Service Account](https://i.ibb.co/hVN7drg/Screenshot-2021-05-07-at-1-05-39-PM.png)

You fill get a JSON file. Copy the JSON file contents and go to https://base64.guru/converter and paste your contents in the 'Text' field and click 'Encode text to Base64' button, as shown below:

![Base 64 Converter](https://i.ibb.co/mBTSDtp/Screenshot-2021-05-07-at-1-09-11-PM.png)

Finally copy the Base64 String and save into your `.env` file as follows:

````
SERVICE_ACCOUNT_KEY = <YOUR BASE64 TEXT>
````

## Issues and Pull Requests

If you found any issues or want to make any suggestions, please feel free to [open an Issue](https://github.com/luciferreeves/vaccinosaurus/issues).

If you have fixed an issue and want to merge your code with us, then please [open a Pull Request](https://github.com/luciferreeves/vaccinosaurus/pulls) and add necessary description along with the issue that your pull request fixes.

> _If you like the work, then please add your name to the [Stargazers list](https://github.com/luciferreeves/vaccinosaurus/stargazers) by starring the repository._

## License

This work is available under the MIT license. Please see the [LICENSE](LICENSE) file for details.
