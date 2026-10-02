---
title: Login, Logout and Sessions
source: pdf pp. 16-17, sec 3.1
summary: How to log in to and out of Service Layer, the B1SESSION and ROUTEID cookies, and how sessions are used in subsequent requests.
---

# Login, Logout and Sessions

> **Recommendation**
>
> To test Service Layer without developing a program, you can install the "POSTMAN" browser extension in Google Chrome, or install equivalent add-ons on other browsers.

## Login and Logout

Before you perform any operation in Service Layer, you first need to log into Service Layer.

Send this HTTP request for login:

```http
POST https://<Server Name/IP>:<Port>/b1s/v1/Login
{"CompanyDB": "US506", "UserName": "manager", "Password": "1234"}
```

> **Note**
>
> As of SAP Business One 10.0 FP2305, you can log in to the Service Layer with a Windows domain user account after activating the Active Directory Domain Services and binding its users to company users. For more information, please refer to the *SL Connection References* part in the guide *Identity and Authentication Management in SAP Business One* on the SAP Help Portal.

If the login is successful, you get the following response:

```http
HTTP/1.1 200 OK
Set-Cookie: B1SESSION=PTRzIjYK-weN6-1Lx1-ZG0J-3ARxfjcU0Shy;HttpOnly;
Set-Cookie: ROUTEID=.node1; path=/b1s
{
    "odata.metadata": "https://databaseserver:50000/b1s/v1/$metadata#B1Sessions/
@Element",
    "SessionId": "PTRzIjYK-weN6-1Lx1-ZG0J-3ARxfjcU0Shy",
    "Version": "1000110",
    "SessionTimeout": 30
}
```

The response of `Login` request indicates that Service Layer inserts a cookie in the response header, with the cookie name 'B1SESSION' and cookie value 'PTRzIjYK-weN6-1Lx1-ZG0J-3ARxfjcU0Shy' respectively. In addition, another cookie item (ROUTEID=.node1) is returned by Apache server to ensure the load balancer stickiness.

Send this HTTP request for logout:

```http
POST /Logout
Cookie: B1SESSION=PTRzIjYK-weN6-1Lx1-ZG0J-3ARxfjcU0Shy; ROUTEID=.node1
```

If the logout is successful, you get the following response, without any response content:

```http
HTTP/1.1 204 No Content
```

## Session

A session is started by a login request and is ended by a logout request. Each valid session has a unique session ID which is distinguished by a GUID-like string. To make subsequent requests after login, the cookie item `B1SESSION` is mandatory and shall be set in each request header. `ROUTEID` is optional. It ensures the session stickiness and optimizes performance through efficient load balancing. For example, to get an `Item` with ID='i001', send the following request with a cookie:

```http
GET /Items('i001')
Cookie: B1SESSION=PTRzIjYK-weN6-1Lx1-ZG0J-3ARxfjcU0Shy; ROUTEID=.node1
```

If you write a client application in Windows desktop mode (not in Browser Access mode), do not forget to add the cookie item in the HTTP header, as in the above example of Logout. Otherwise, you may receive the "Invalid session" error:

```http
HTTP/1.1 401 Unauthorized
{
   "error" : {
      "code" : 301,
      "message" : {
         "lang" : "en-us",
         "value" : "Invalid session or session already timeout."
      }
   }
}
```

> **Note**
>
> If your application is written in JavaScript and runs in Browser Access mode, you do not need to set the cookie each time you send a request, since most Web browsers are able to handle the cookie transparently.
