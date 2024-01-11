git config --global --add safe.directory '*'
cd ./daprdocs
git submodule update --init --recursive
npm install
