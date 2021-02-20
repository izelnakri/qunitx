# QUnitx

Experimental improvements, suggestions for qunit CLI

![Qunitx terminal output](https://raw.githubusercontent.com/izelnakri/qunitx/main/docs/qunitx-help-stdout.png)

Default test output is TAP(Test-Anything-Protocol_) thus you can use any tap reporter of your choice to display test
output in anyway you like. Example:

```
# using it with tap-difflet TAP reporter:
qunitx tests/attachments tests/user | npx tap-difflet
```

#### Installation:

```sh
npm install -g qunitx

qunitx
```
