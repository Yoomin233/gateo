# GateO

gateio.co alternative

## online demo

[see this link](https://yueminhu.github.io/gateo/output)

**Attention:** Due to server response limitations, all http-related requests (querying historical orders, placing orders) will be unavailable unless you check the 'use http proxy' option at login([see below](#http-proxy)). Websockets are uneffected.

You can view as a visitor(click the checkbox 'I am a visitor'), or fill in the `api key` and `api secret` to start viewing your assets & trading. Your key and secret will only be used locally. Key and secret can be generated from [this link](https://www.gateio.co/myaccount/apikeys). **Act with caution!!**

## http-proxy

If this option is checked, all http requests will be send to my server for transparent proxy, to circumvent the CORS problem. If you are concerned about this, please uncheck this option at login.

## screenshots

![alt text](https://yueminhu.github.io/gateo/screenshots/fig_1.jpg)

<p style='text-align: center'>login & main page</p>

![alt text](https://yueminhu.github.io/gateo/screenshots/fig_2.jpg)

<p style='text-align: center'>main page, unexecuted orders overview, finished orders overview & quick reverse order placement</p>

Dark mode is available!

### local dev

```sh
git clone --recurse-submodules https://github.com/YueminHu/gateo.git

cd gateo
npm install # or yarn, if you have it installed
npm run dev
# or  git clone https://github.com/YueminHu/gateo.git &&  cd gateo && gut submodule init && git submodule update
```

then goto `http://localhost:8080`

**⚠️The author of this repository holds no responsibility to any assets lost caused by using this project. All trading-related requests are thoroughly tested but not guaranteed. Recreational and educational usage only. Miuse may lead to bankruptcy💸!**

todos:

[x]: optimize update_balance method(instead of fetch whole data);

[x]: optimize fetch_orders method(instead of fetch whole data);

[x]: add pull_to_refresh;
