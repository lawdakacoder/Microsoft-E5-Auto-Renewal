<div align="center"><h1>Microsoft E5 Auto Renewal</h1>
<b>An open-source JavaScript web server for the automatic renewal of Microsoft’s Developer E5 subscription accounts.</b></div><br>

## **📑 INDEX**

* [**❓ How to use?**](#how-to-use)
* [**🛠️ Deployment**](#deployment)
* [**❤️ Credits**](#credits)

<a name="how-to-use"></a>

## ❓ How to use?

**By following the steps given below, you can use the public instance without deploying your own server or requiring any setup.**

* Acquire your client ID and secret as given [here](https://github.com/TheCaduceus/Microsoft-E5-Auto-Renewal?tab=readme-ov-file#-variables).
  * Redirect URL should be:

    ```
    https://e5-js.adasin.workers.dev/auth
    ```

* Click [here](https://e5-js.adasin.workers.dev), fill in your authorization client details that you collected above, and follow the on-screen instructions.

  * Your client ID and secret will be securely stored in your browser in an encrypted form to complete the authorization process. Once you close your browser, they will be erased.

<div align="center"> <img src="https://github.com/user-attachments/assets/e15403b2-72ea-401f-8645-d3f8d2b95cb1"> </div><br>

* Now create a cron-job [here](https://cron-job.org) or on platform of your choice with the details displayed by the website.

  * Interval can be from 1 hour to 8 hours.

<div align="center"> <img src="https://github.com/user-attachments/assets/704627fc-cedb-467e-9a91-befba15c2ec7"> </div><br>

> [!TIP]
> * To increase the chances of getting your subscription renewed, configure the tool for your subscription’s admin accounts first, and then for non-admin accounts.
> * All refresh tokens issued by the website have a validity period of 90 days from the date of issue. You can acquire a new refresh token by logging in using the same URL (bookmark it!).

* You did it!🎉

<a name="deployment"></a>

## **🛠️ Deployment**

1.Install [Git](https://git-scm.com/downloads), [Node.JS](https://nodejs.org/en/download/package-manager) and [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

2.Clone repository:
```
git clone https://github.com/lawdakacoder/Microsoft-E5-Auto-Renewal.git
```

3.Change Directory:
```
cd Microsoft-E5-Auto-Renewal
```

4.Fill [config.js](https://github.com/lawdakacoder/Microsoft-E5-Auto-Renewal/blob/main/src/config.js) file.

5.Using Wrangler
  * Install wrangler

    ```
    npm install wrangler
    ```
  * Login in Wrangler

    ```
    npx wrangler login
    ```
  * Deploy to Cloudflare worker

    ```
    npx wrangler deploy
    ```

<a name="credits"></a>

## **❤️ Credits**
[**Dr.Caduceus**](https://github.com/TheCaduceus): Developer of original repository (Python).
[**LawdaKaCoder**](https://github.com/lawdakacoder): Developer of Microsoft-E5-Auto-Renewal (JavaScript) and for lawda.<br>
[**Cloudflare**](https://cloudflare.com): For workers and great documentation that no one can understand.
