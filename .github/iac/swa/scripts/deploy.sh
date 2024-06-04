#!/bin/bash

output=$(azd env get-values)

while IFS= read -r line; do
  name=$(echo $line | cut -d'=' -f1)
  value=$(echo $line | cut -d'=' -f2 | sed 's/^"\|"$//g')
  export $name=$value
  echo "$name=$value"
done <<<$output

echo "Environment variables set."

commands=("az" "swa" "func")

for cmd in "${commands[@]}"; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: $cmd command is not available, check pre-requisites in README.md"
    exit 1
  fi
done

# az account set --subscription $AZURE_SUBSCRIPTION_ID

cd $SWA_APP_PATH
SWA_DEPLOYMENT_TOKEN=$(az staticwebapp secrets list --name $AZURE_STATICWEBSITE_NAME --query "properties.apiKey" --output tsv)
if [[ -n $SWA_DEPLOYMENT_TOKEN ]]; then
  swa deploy --env production --deployment-token $SWA_DEPLOYMENT_TOKEN
else
  echo "SWA_DEPLOYMENT_TOKEN is empty, not deployoing froentend, check if the static website is created in Azure portal."
fi
