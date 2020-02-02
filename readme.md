# GateO

gateio.co alternative

## online demo

[see this link](https://yueminhu.github.io/gateo/output)

**Attention:** Due to server response limitations, all http-related requests (querying historical orders, placing orders) will be unavailable unless you check the 'use http proxy' option at login([see below](#http-proxy)). Websockets are uneffected.

You can view as a visitor(click the checkbox 'I am a visitor'), or fill in the `api key` and `api secret` to start viewing your assets & trading. Your key and secret will only be used locally. Key and secret can be generated from [this link](https://www.gateio.co/myaccount/apikeys). **Act with caution!!**

## http-proxy
If this option is checked, all http requests will be send to my server for transparent proxy, to circumvent the CORS problem. If you are concerned about this, please uncheck this option at login.

## screenshots

![alt text](https://i.ibb.co/grVv7ww/Screen-Shot-2020-01-31-at-9-31-39-PM.jpg)

![alt text](https://i.ibb.co/3m163vC/Screen-Shot-2020-01-31-at-9-30-27-PM.jpg)

### Mobile
![alt text](https://i.ibb.co/T1jLnJG/IMG-4236-1.jpg)

### local dev

```sh
git clone --recurse-submodules https://github.com/YueminHu/gateo.git
cd gateo
npm install # or yarn, if you have it installed
npm run dev
```

then goto `http://localhost:8080`

**⚠️The author of this repository holds no responsibility to any assets lost caused by using this project. All trading-related requests are thoroughly tested but not guaranteed. Recreational and educational usage only. Miuse may lead to bankruptcy💸!**
