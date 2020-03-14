FROM mcr.microsoft.com/dotnet/core/runtime:2.1
RUN mkdir /lf
WORKDIR /lf
RUN curl -LsO https://github.com/microsoft/ApplicationInsights-LocalForwarder/releases/download/v0.1-beta1/LF-ConsoleHost-linux-x64.tar.gz
RUN tar xzf LF-ConsoleHost-linux-x64.tar.gz
RUN rm -f LF-ConsoleHost-linux-x64.tar.gz
EXPOSE 55678
ENTRYPOINT ["/lf/Microsoft.LocalForwarder.ConsoleHost", "noninteractive"]
