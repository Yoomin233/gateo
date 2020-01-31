# GateO

gateio.co alternative

## online demo

**Attention:** Due to gate.io server response limitations, all http-related requests(query historical orders, place orders) are only available in [local mode](#localmode)(see below)! Websockets are uneffected.

## screenshots

![alt text](https://i.ibb.co/grVv7ww/Screen-Shot-2020-01-31-at-9-31-39-PM.jpg)

![alt text](https://i.ibb.co/3m163vC/Screen-Shot-2020-01-31-at-9-30-27-PM.jpg)

## localmode

Http calls are available in this mode, since we set up a proxy server locally.

### usage

```sh
git clone --recurse-submodules https://github.com/YueminHu/gateo.git
cd gateo
npm install # or yarn, if you have it installed
npm run dev
```

then goto `http://localhost:8080`

From now on you can view as a visitor(click the button 游客登陆), or fill in the `api key` and `api secret` to start viewing your assets & trading. Key and secret can be generated from [this link](https://www.gateio.co/myaccount/apikeys). **Act with caution!!**

**⚠️The author of this repository holds no responsibility to any assets lost caused by using this project. All trading-related requests are thoroughly tested but not guaranteed. Recreational and educational usage only. Miuse may lead to bankruptcy💸!**
