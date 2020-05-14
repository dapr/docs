# Extending Dapr
 
Dapr can be extended by using itself as a library to create a new custom binary. For instance, create a new GO project, then copy original [main.go](https://github.com/dapr/dapr/blob/master/cmd/daprd/main.go) from Dapr Github source code to this new project(using Dapr as library), next stitch together all the Components(Dapr runtime) in the same way as it was present in the original `main.go` and then build Go project. The new binary created is a custom `Daprd` binary.
 
You can include Dapr as library by pulling it as dependency,
 
- Add Dapr code base as dependency - `go get -u github.com/dapr/dapr`
- Add Component-Contrib code base as dependency - `go get -u github.com/dapr/components-contrib`
 
## Adding custom functionality as gRPC endpoints
 
Dapr provides a `CustomComponent` abstraction to add a custom feature as a gRPC endpoint. gRPC is useful for low-latency, high performance scenarios and has deep language integration using the proto clients.
 
```go
type CustomComponent interface {
   Init(metadata Metadata) error
   RegisterServer(s *grpc.Server) error
}
```
 
The `Init` method is called by the Dapr runtime to initialize the custom components. Properties set in YAML manifests are passed to Init method as a key value map (Metadata).
 
In the `RegisterServer` method, Dapr runtime passes an instance of an internal `grpc.Server` to register new gRPC endpoints. Implementation can register a new gRPC server by calling the `RegisterServer` method on auto-generated proto stubs.
 
```go
func (c *Crypto) RegisterServer(s *grpc.Server) error {
   RegisterCryptoServer(s, c)
   return nil
}
```
 
## Custom component manifest
 
This custom component is configured declaratively using [YAML manifest](./components/crypto.yaml)
 
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
 name: cryptoextension
spec:
 type: custom.mycrypto
 metadata:
   - name: base
     value: randompassphrase
   - name: salt
     value: s3cret
   - name: bits
     value: 256
```     
 
Above, `custom` is a prefix which will identify this manifest as a user provided custom component. The name `mycrypto` should match the name provided in [Main.go](./cmd/daprd/main.go) component registration.
 
 
## Register custom components.
 
In custom `main.go`, you can register a new CustomComponent in Dapr runtime.
 
```go
runtime.WithCustomComponents(
   customs_loader.New("mycrypto", func() customs_loader.CustomComponent {
           return custom_crypto.New(logContrib)
   }),
),
```
 
Dapr will read the `custom.mycrypto` component manifest, initialize custom components by passing all the given properties in manifest as `Metadata` to `Init` method, and finally call the `RegisterServer` method to register additional gRPC endpoint in to server runtime.