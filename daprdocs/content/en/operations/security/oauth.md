---
type: docs
title: "Configure endpoint authorization with OAuth"
linkTitle: "Configure endpoint authorization with OAuth"
weight: 2000
description: "Enable OAuth authorization on application endpoints for your web APIs"
---

Dapr OAuth 2.0 [middleware]({{< ref "middleware.md" >}}) allows you to enable [OAuth](https://oauth.net/2/) authorization on Dapr endpoints for your web APIs using the [Authorization Code Grant flow](https://tools.ietf.org/html/rfc6749#section-4.1).
You can also inject authorization tokens into your endpoint APIs which can be used for authorization towards external APIs called by your APIs using the [Client Credentials Grant flow](https://tools.ietf.org/html/rfc6749#section-4.4).
When the middleware is enabled any method invocation through Dapr needs to be authorized before getting passed to the user code.

The main difference between the two flows is that the `Authorization Code Grant flow` needs user interaction and authorizes a user where the `Client Credentials Grant flow` doesn't need a user interaction and authorizes a service/application.

## Register your application with an authorization server

Different authorization servers provide different application registration experiences. Here are some samples:
<!-- IGNORE_LINKS -->
* [Azure AAD](https://docs.microsoft.com/azure/active-directory/develop/v1-protocols-oauth-code)
* [Facebook](https://developers.facebook.com/apps)
* [Fitbit](https://dev.fitbit.com/build/reference/web-api/oauth2/)
* [GitHub](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/)
* [Google APIs](https://console.developers.google.com/apis/credentials/consen)
* [Slack](https://api.slack.com/docs/oauth)
* [Twitter](http://apps.twitter.com/)
<!-- END_IGNORE -->
To configure the Dapr OAuth middleware, you'll need to collect the following information:

* Client ID (see [here](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* Client secret (see [here](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* Scopes (see [here](https://oauth.net/2/scope/))
* Authorization URL
* Token URL

Authorization/Token URLs of some of the popular authorization servers:

<!-- IGNORE_LINKS -->
| Server  | Authorization URL | Token URL |
|---------|-------------------|-----------|
|Azure AAD|<https://login.microsoftonline.com/{tenant}/oauth2/authorize>|<https://login.microsoftonline.com/{tenant}/oauth2/token>|
|GitHub|<https://github.com/login/oauth/authorize>|<https://github.com/login/oauth/access_token>|
|Google|<https://accounts.google.com/o/oauth2/v2/auth>|<https://accounts.google.com/o/oauth2/token> <https://www.googleapis.com/oauth2/v4/token>|
|Twitter|<https://api.twitter.com/oauth/authorize>|<https://api.twitter.com/oauth2/token>|
<!-- END_IGNORE -->

## Define the middleware component definition

### Define an Authorization Code Grant component

An OAuth middleware (Authorization Code) is defined by a component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
  namespace: default
spec:
  type: middleware.http.oauth2
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "<comma-separated scope names>"
  - name: authURL
    value: "<authorization URL>"
  - name: tokenURL
    value: "<token exchange URL>"
  - name: redirectURL
    value: "<redirect URL>"
  - name: authHeaderName
    value: "<header name under which the secret token is saved>"
    # forceHTTPS:
    # This key is used to set HTTPS schema on redirect to your API method
    # after Dapr successfully received Access Token from Identity Provider.
    # By default, Dapr will use HTTP on this redirect.
  - name: forceHTTPS
    value: "<set to true if you invoke an API method through Dapr from https origin>"
```

### Define a custom pipeline for an Authorization Code Grant

To use the OAuth middleware (Authorization Code), you should create a [custom pipeline]({{< ref "middleware.md" >}})
using [Dapr configuration]({{< ref "configuration-overview" >}}), as shown in the following sample:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  httpPipeline:
    handlers:
    - name: oauth2
      type: middleware.http.oauth2
```

### Define a Client Credentials Grant component

An OAuth (Client Credentials) middleware is defined by a component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: myComponent
spec:
  type: middleware.http.oauth2clientcredentials
  version: v1
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "<comma-separated scope names>"
  - name: tokenURL
    value: "<token issuing URL>"
  - name: headerName
    value: "<header name under which the secret token is saved>"
  - name: endpointParamsQuery
    value: "<list of additional key=value settings separated by ampersands or semicolons forwarded to the token issuing service>"
    # authStyle:
    # "0" means to auto-detect which authentication
    # style the provider wants by trying both ways and caching
    # the successful way for the future.

    # "1" sends the "client_id" and "client_secret"
    # in the POST body as application/x-www-form-urlencoded parameters.

    # "2" sends the client_id and client_password
    # using HTTP Basic Authorization. This is an optional style
    # described in the OAuth2 RFC 6749 section 2.3.1.
  - name: authStyle
    value: "<see comment>"
```

### Define a custom pipeline for a Client Credentials Grant

To use the OAuth middleware (Client Credentials), you should create a [custom pipeline]({{< ref "middleware.md" >}})
using [Dapr configuration]({{< ref "configuration-overview.md" >}}), as shown in the following sample:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: pipeline
  namespace: default
spec:
  httpPipeline:
    handlers:
    - name: myComponent
      type: middleware.http.oauth2clientcredentials
```

## Apply the configuration

To apply the above configuration (regardless of grant type)
to your Dapr sidecar, add a ```dapr.io/config``` annotation to your pod spec:

```yaml
apiVersion: apps/v1
kind: Deployment
...
spec:
  ...
  template:
    metadata:
      ...
      annotations:
        dapr.io/enabled: "true"
        ...
        dapr.io/config: "pipeline"
...
```

## Accessing the access token

### Authorization Code Grant

Once everything is in place, whenever a client tries to invoke an API method through Dapr sidecar
(such as calling the *v1.0/invoke/* endpoint),
it will be redirected to the authorization's consent page if an access token is not found.
Otherwise, the access token is written to the **authHeaderName** header and made available to the app code.

### Client Credentials Grant

Once everything is in place, whenever a client tries to invoke an API method through Dapr sidecar
(such as calling the *v1.0/invoke/* endpoint),
it will retrieve a new access token if an existing valid one is not found.
The access token is written to the **headerName** header and made available to the app code.
In that way the app can forward the token in the authorization header in calls towards the external API requesting that token.
