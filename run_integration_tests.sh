cd integration-test
TMPDIR=/private$TMPDIR docker-compose up -d
if [ $? -eq 0 ]
then
  echo "Successfully started docker"
else
  echo "Could not start docker" >&2
  exit 1
fi
terraform init
if [ $? -eq 0 ]
then
  echo "Successfully started terraform"
else
  echo "Could not start terraform" >&2
  exit 1
fi
terraform apply -auto-approve
if [ $? -eq 0 ]
then
  echo "Successfully created resources"
else
  echo "Could not create resources" >&2
  exit 1
fi
cd ..
npm run integration-test
if [ $? -eq 0 ]
then
  echo "Successfully ran integration test"
else
  echo "Failed integration test" >&2
  exit 1
fi
cd integration-test
terraform destroy --auto-approve
if [ $? -eq 0 ]
then
  echo "Successfully destroyed resources"
else
  echo "Failed to destroy resources" >&2
  exit 1
fi
