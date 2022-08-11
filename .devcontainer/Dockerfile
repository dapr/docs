# the following version can be overridden at image build time with --build-arg
ARG HUGO_VERSION=0.101.0
# remove/comment the following line completely to compile vanilla Hugo:
ARG HUGO_BUILD_TAGS=extended

# Hugo >= v0.81.0 requires Go 1.16+ to build
ARG GO_VERSION=1.18
ARG ALPINE_VERSION=3.16

# ---

FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS build

# renew global args from above
# https://docs.docker.com/engine/reference/builder/#scope
ARG HUGO_VERSION
ARG HUGO_BUILD_TAGS

ARG CGO=1
ENV CGO_ENABLED=${CGO}
ENV GOOS=linux
ENV GO111MODULE=on

WORKDIR /go/src/github.com/gohugoio/hugo

# gcc/g++ are required to build SASS libraries for extended version
RUN apk add --update --no-cache \
      gcc \
      g++ \
      musl-dev \
      git

# clone source from Git repo:
RUN git clone \
      --branch "v${HUGO_VERSION}" \
      --single-branch \
      --depth 1 \
      https://github.com/gohugoio/hugo.git ./

# https://github.com/gohugoio/hugo/commit/241481931f5f5f2803cd4be519936b26d8648dfd
RUN go build -v -ldflags "-X github.com/gohugoio/hugo/common/hugo.vendorInfo=docker" -tags "$HUGO_BUILD_TAGS" && \
    mv ./hugo /go/bin/hugo

# fix potential stack size problems on Alpine
# https://github.com/microsoft/vscode-dev-containers/blob/fb63f7e016877e13535d4116b458d8f28012e87f/containers/hugo/.devcontainer/Dockerfile#L19
RUN go install github.com/yaegashi/muslstack@latest && \
    muslstack -s 0x800000 /go/bin/hugo

# ---

FROM alpine:${ALPINE_VERSION}

# renew global args from above & pin any dependency versions
ARG HUGO_VERSION
# https://github.com/jgm/pandoc/releases
ARG PANDOC_VERSION=2.18
# https://github.com/sass/dart-sass-embedded/releases
ARG DART_SASS_VERSION=1.54.0

LABEL version="${HUGO_VERSION}"
LABEL repository="https://github.com/jakejarvis/hugo-docker"
LABEL homepage="https://jarv.is/"
LABEL maintainer="Jake Jarvis <jake@jarv.is>"

# https://docs.github.com/en/free-pro-team@latest/packages/managing-container-images-with-github-container-registry/connecting-a-repository-to-a-container-image#connecting-a-repository-to-a-container-image-on-the-command-line
LABEL org.opencontainers.image.source="https://github.com/jakejarvis/hugo-docker"

# bring over patched binary from build stage
COPY --from=build /go/bin/hugo /usr/bin/hugo

# this step is intentionally a bit of a mess to minimize the number of layers in the final image
RUN set -euo pipefail && \
    if [ "$(uname -m)" = "x86_64" ]; then \
      ARCH="amd64"; \
    elif [ "$(uname -m)" = "aarch64" ]; then \
      ARCH="arm64"; \
    else \
      echo "Unknown build architecture, quitting." && exit 2; \
    fi && \
    # alpine packages
    # libc6-compat & libstdc++ are required for extended SASS libraries
    # ca-certificates are required to fetch outside resources (like Twitter oEmbeds)
    apk add --update --no-cache \
      ca-certificates \
      tzdata \
      git \
      nodejs \
      npm \
      go \
      python3 \
      py3-pip \
      ruby \
      libc6-compat \
      libstdc++ && \
    update-ca-certificates && \
    # npm packages
    npm install --global --production \
      yarn \
      postcss \
      postcss-cli \
      autoprefixer \
      @babel/core \
      @babel/cli && \
    npm cache clean --force && \
    # ruby gems
    gem install asciidoctor && \
    # python packages
    python3 -m pip install --no-cache-dir --upgrade Pygments==2.* docutils && \
    # manually fetch pandoc binary
    wget -O pandoc.tar.gz https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-${ARCH}.tar.gz && \
    tar xf pandoc.tar.gz && \
    mv ./pandoc-${PANDOC_VERSION}/bin/pandoc /usr/bin/ && \
    chmod +x /usr/bin/pandoc && \
    rm -rf pandoc.tar.gz pandoc-${PANDOC_VERSION} && \
    # manually fetch Dart SASS binary (on x64 only)
    if [ "$ARCH" = "amd64" ]; then \
      wget -O sass-embedded.tar.gz https://github.com/sass/dart-sass-embedded/releases/download/${DART_SASS_VERSION}/sass_embedded-${DART_SASS_VERSION}-linux-x64.tar.gz && \
      tar xf sass-embedded.tar.gz && \
      mv ./sass_embedded/dart-sass-embedded /usr/bin/ && \
      chmod +x /usr/bin/dart-sass-embedded && \
      rm -rf sass-embedded.tar.gz sass_embedded; \
    fi && \
    # clean up some junk
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* && \
    # make super duper sure that everything went OK, exit otherwise
    hugo env && \
    go version && \
    node --version && \
    npm --version && \
    yarn --version && \
    postcss --version && \
    autoprefixer --version && \
    babel --version && \
    pygmentize -V && \
    asciidoctor --version && \
    pandoc --version && \
    rst2html.py --version


# add site source as volume
VOLUME /src
WORKDIR /src

# fatal: detected dubious ownership in repository at '/workspaces/dapr-docs'
# https://stackoverflow.com/a/73100228/5167537
RUN git config --global --add safe.directory '*'

# expose live-refresh server on default port
EXPOSE 1313

ENTRYPOINT ["hugo"]