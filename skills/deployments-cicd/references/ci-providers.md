# Other CI Providers

Use this reference to deploy from GitLab CI or Bitbucket Pipelines. Set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as CI/CD variables, as described in the skill's Required Environment Variables section.

## GitLab CI

```yaml
deploy:
  image: node:20
  stage: deploy
  script:
    - npm install -g vercel
    - vercel pull --yes --environment=production --token=$VERCEL_TOKEN
    - vercel build --prod --token=$VERCEL_TOKEN
    - vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
  only:
    - main
```

## Bitbucket Pipelines

```yaml
pipelines:
  branches:
    main:
      - step:
          name: Deploy to Vercel
          image: node:20
          script:
            - npm install -g vercel
            - vercel pull --yes --environment=production --token=$VERCEL_TOKEN
            - vercel build --prod --token=$VERCEL_TOKEN
            - vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```
