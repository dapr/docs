# Configure API authorization with OAuth

Dapr OAuth 2.0 [middleware](../../concepts/middleware/README.md) allows you to enable [OAuth](https://oauth.net/2/) authorization on Dapr endpoints for your web APIs, using the [Authorization Code Grant flow](https://tools.ietf.org/html/rfc6749#section-4.1). When the middleware is enabled, any method invocation through Dapr needs to be authorized before getting passed to the user code.

## Register your application with a authorization server

Different authorization servers provide different application registration experiences. Here are some samples:

* [Azure AAD](https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code)
* [Facebook](https://developers.facebook.com/apps)
* [Fitbit](https://dev.fitbit.com/build/reference/web-api/oauth2/)
* [GitHub](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/)
* [Google APIs](https://console.developers.google.com/apis/credentials/consen)
* [Slack](https://api.slack.com/docs/oauth)
* [Twitter](http://apps.twitter.com/)

To figure the Dapr OAuth middleware, you'll need to collect the following information:

* Client ID (see [here](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* Client secret (see [here](https://www.oauth.com/oauth2-servers/client-registration/client-id-secret/))
* Scopes (see [here](https://oauth.net/2/scope/))
* Authorization URL
* Token URL

Authorization/Token URLs of some of the popular authorization servers:

|Server|Authorization URL|Token URL|
|--------|--------|--------|
|Azure AAD|https://login.microsoftonline.com/{tenant}/oauth2/authorize|https://login.microsoftonline.com/{tenant}/oauth2/token|
|GitHub|https://github.com/login/oauth/authorize|https://github.com/login/oauth/access_token|
|Google|https://accounts.google.com/o/oauth2/v2/auth|https://accounts.google.com/o/oauth2/token https://www.googleapis.com/oauth2/v4/token|
|Twitter|https://api.twitter.com/oauth/authorize|https://api.twitter.com/oauth2/token|

## Define the middleware component definition

An OAuth middleware is defined by a component:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: oauth2
  namespace: default
spec:
  type: middleware.http.oauth2
  metadata:
  - name: clientId
    value: "<your client ID>"
  - name: clientSecret
    value: "<your client secret>"
  - name: scopes
    value: "<comma-separated scope names>"
  - name: authURL
    value: "<authroziation URL>"
  - name: tokenURL
    value: "<token exchange URL>"
  - name: redirectURL
    value: "<redirect URL>"
  - name: authHeaderName
    value: "<header name under which the secret token is saved>"
```

## Define a custom pipeline

To use the OAuth middleware, you should create a [custom pipeline](../../concepts/middleware/README.md) using [Dapr configuration](../../concepts/configuration/README.md), as shown in the following sample:

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

## Apply the configuration

To apply the above configuration to your Dapr sidecar, add a ```dapr.io/config``` annotation to your pod spec:

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

Once everything is in place, whenever a client tries to invoke an API method through Dapr sidecar (such as calling the *v1.0/invoke/* endpoint), it will be reidrected to the authorization's consent page if an access token is not found. Otherwise, the access token is written to the **authHeaderName** header and made available to the app code.
