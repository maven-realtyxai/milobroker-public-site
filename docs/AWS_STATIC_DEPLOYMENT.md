# Deploy MiloBroker with CodePipeline, S3, and CloudFront

This guide documents the selected production path:

```text
GitHub release tag → CodePipeline → CodeBuild → private S3 bucket → CloudFront invalidation
```

CodeBuild creates the Vite static bundle. CodePipeline deploys that bundle to S3 and then starts a separate CodeBuild action to invalidate CloudFront after the upload succeeds. CloudFront serves HTTPS to visitors. The site does not need EC2, Docker, NGINX, ECR, or Kubernetes for this architecture.

## What is confirmed and what is assumed

1. **Confirmed from this repository:** this is a React + TypeScript SPA built with Vite. `npm ci` installs the lockfile dependencies. `npm run build` runs the TypeScript check and Vite build, producing `dist/`. `package.json` requires Node.js 22 or later. The app has no router, database, or Java backend in this repository.
2. **User-selected:** use GitHub, CodePipeline, CodeBuild, S3, and CloudFront in AWS Region `ap-southeast-2`.
3. **Not verified or created:** AWS resources, the GitHub connection, IAM policies, certificate, BigRock DNS records, billing model, and repository protection settings. Review AWS console values and cost before creating resources.
4. **Current repository mismatch:** `.github/workflows/deploy-ec2.yml` still describes deployment to EC2 using ECR and SSM. It does not implement this pipeline. Disable or replace that workflow before pushing any release tag, or the old EC2 deployment workflow may run too.

## Architecture roles

| Component | Role |
| --- | --- |
| GitHub | Stores the source and release tags. A GitHub App connection lets CodePipeline read the repository. |
| CodePipeline | Coordinates the source, build, S3 deployment, and post-deployment invalidation stages. |
| CodeBuild | Runs `npm ci` and `npm run build`; a second CodeBuild action requests CloudFront invalidation after S3 deployment. |
| Pipeline artifact bucket | Temporary S3 storage for CodePipeline artifacts. It is separate from the website bucket and can incur storage/request costs. |
| Private website bucket | Stores the built `dist/` files. Block Public Access stays enabled. |
| CloudFront + OAC | Serves the files over HTTPS and is the only allowed reader of the private website bucket. |
| BigRock DNS | Keeps managing the purchased domain and points `www.milobroker.com` to CloudFront. Route 53 is optional. |

## Prerequisites

1. A working AWS project/account in `ap-southeast-2`, with access to CodePipeline, CodeBuild, S3, CloudFront, ACM, and IAM. If the new AWS experience restricts a service or feature on your current plan, check its project settings before proceeding.
2. The application repository connected to GitHub and a `main` branch whose CI check passes.
3. Permission to install/authorize the AWS CodeConnections GitHub App for this repository.
4. Access to edit DNS records at BigRock for `milobroker.com`.
5. Cost visibility enabled. Use the [AWS Pricing Calculator](https://calculator.aws/) and check regional/service prices before creating resources.

## Setup

1. **Protect the release branch.** In GitHub, require pull requests into `main`, require the `Validate MiloBroker SPA / Type-check and build` CI check, and block direct pushes if your repository plan supports it. CI should run on a PR and again after merge. Only tag a commit after the post-merge CI on `main` is green.

2. **Review cost and account limits.** This design avoids an always-on EC2 VM, but is not guaranteed to cost $0. Charges may include S3 requests/storage, CodeBuild minutes, CodePipeline action minutes, artifact storage, CloudFront usage, invalidations over the included monthly paths, CloudWatch logs, and applicable taxes. Free allowances depend on the account and pricing model; do not assume the quoted `$0–$1/month` estimate. AWS currently lists 100 monthly CodeBuild minutes for eligible small on-demand build types, and different V1/V2 CodePipeline pricing/free allowances. CloudFront pay-as-you-go has separate published usage allowances, but verify the allowance and plan shown in your AWS project. Sources: [S3](https://aws.amazon.com/s3/pricing/), [CodeBuild](https://aws.amazon.com/codebuild/pricing/), [CodePipeline](https://aws.amazon.com/codepipeline/pricing/), [CloudFront](https://aws.amazon.com/cloudfront/pricing/).

3. **Create the website bucket.** In S3, create a globally unique bucket name in `ap-southeast-2`, for example `www.milobroker.com` if available. Keep **Block all public access enabled** and leave Object Ownership as bucket-owner-enforced. Do not enable static website hosting for this private-origin design. Turn on bucket versioning if you want simple rollback of uploaded objects; account for old versions in storage cost. The pipeline artifact bucket is a separate bucket, often created by the CodePipeline wizard.

4. **Request a public TLS certificate.** Open AWS Certificate Manager in **`us-east-1`** (CloudFront requires its ACM viewer certificate there). Request a public certificate for `www.milobroker.com`; optionally include `milobroker.com` if you will serve the apex too. Choose DNS validation. Add the exact ACM validation CNAME record(s) at BigRock and wait for the certificate status to become **Issued**. Do not alter nameservers or existing MX/TXT mail records.

5. **Create the CloudFront distribution.** Create a distribution with the S3 bucket's normal regional REST origin, not an `s3-website-...` website endpoint. Create/attach an Origin Access Control (OAC) and enable signed requests. Set the default root object to `index.html`. Add `www.milobroker.com` as an alternate domain name and attach the issued ACM certificate. Redirect viewer HTTP to HTTPS. Leave the S3 bucket private. After creating the distribution, update the bucket policy to allow `s3:GetObject` only to the CloudFront service principal for this distribution (the console's OAC workflow can generate the policy). Do not add a wildcard public-read policy or turn off Block Public Access. See [CloudFront OAC for S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).

6. **Handle SPA paths only if needed.** The current app has no client-side router, so section links such as `#about` do not need an error-page rewrite. If future routes require browser refresh/deep links, configure CloudFront custom errors for the S3 missing-object response to serve `/index.html` with viewer status `200`, then test missing asset URLs separately. A broad 403/404 rewrite can return HTML for a missing JavaScript or image asset, so verify the behavior before enabling it. See [CloudFront custom error pages](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/creating-custom-error-pages.html).

7. **Add the website DNS record at BigRock.** Once CloudFront reports the distribution deployed, create a CNAME record for host `www` pointing to the distribution hostname, such as `d123example.cloudfront.net`. If you also want the bare `milobroker.com` domain, BigRock must support ALIAS/ANAME at the apex or you can use another supported redirect/DNS arrangement; a normal CNAME cannot be used at the DNS zone apex. Leave other DNS records in place. Verify DNS resolution and `https://www.milobroker.com` after propagation.

8. **Create the build specification in the repository root.** Add `buildspec.yml` and commit it to the repository. Use a CodeBuild managed Linux image that supports Node.js 22 or later. For this Vite app:

   ```yaml
   version: 0.2
   phases:
     install:
       runtime-versions:
         nodejs: 22
       commands:
         - npm ci
     build:
       commands:
         - npm run build
   artifacts:
     base-directory: dist
     files:
       - '**/*'
   ```

   Expected: the build finishes successfully and the artifact contains `index.html` plus Vite assets from `dist/`. If CodeBuild says Node.js 22 is not supported by the selected image, select a current standard image that lists Node.js 22; do not change the app's `engines` setting to hide the mismatch. See [CodeBuild buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html).

9. **Create a GitHub connection.** In CodePipeline, create a connection to GitHub using AWS CodeConnections and install/authorize the AWS GitHub App for `maven-realtyxai/milobroker-public-site`. Complete any pending connection confirmation in the AWS console until its status is **Available**. The connection is an authorization link, not an AWS key stored in GitHub. See [CodePipeline GitHub connections](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html).

10. **Create the CodePipeline pipeline.** Choose a V2 pipeline if the wizard requires it for tag triggers. Use a source action with the GitHub CodeConnections provider and the repository's `main` branch as the default branch. Configure the push trigger to include Git tags matching `v*`, rather than triggering on every branch push. This preserves the release-tag deployment gate. CodePipeline supports GitHub tag triggers through CodeConnections; if the console does not offer the tag filter, stop and verify the pipeline type/source provider instead of silently enabling deployment on every `main` push. See [AWS Git tag trigger tutorial](https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-github-tags.html).

11. **Add the CodeBuild stage.** Create a CodeBuild project using the repository root `buildspec.yml`, the current managed Linux standard image with Node.js 22, and a small on-demand compute type. Set the CodePipeline source artifact as input and the build artifact as output. The build command must run before any deploy action; a failed `npm ci` or `npm run build` must fail the pipeline and prevent S3 deployment.

12. **Add the S3 deploy stage.** Add the AWS S3 deploy action after Build. Select the private website bucket, set **Extract file before deploy** to enabled, and leave the deployment path empty so `index.html` and assets are written at the bucket root. Do not set a public canned ACL. For initial correctness, use a conservative Cache-Control setting such as `no-cache` while testing releases. Later, tune caching for `index.html` and Vite's hashed asset files. See [S3 deploy action reference](https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-S3Deploy.html).

13. **Add a separate invalidation stage after S3 deploy.** Create a second CodeBuild project with a repository-root `buildspec-invalidate.yml`, then add it as a CodeBuild action in a stage after the S3 deploy stage. Pass the source artifact to this action. Configure a non-secret project environment variable `CLOUDFRONT_DISTRIBUTION_ID` with the distribution ID. Example buildspec:

   ```yaml
   version: 0.2
   phases:
     post_build:
       commands:
         - aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths '/*'
   ```

   This must be a distinct post-deploy action. A `post_build` command in the first buildspec runs before the S3 deploy stage and can invalidate too early. CloudFront invalidations are billed after the current included monthly path allowance; one wildcard path counts as one invalidation path. Alternatively, use shorter HTML cache settings to reduce how often invalidation is needed.

14. **Review IAM roles.** Let the CodePipeline wizard create its service role and the CodeBuild wizard create project roles, then review and narrow them. Pipeline permissions need to use the GitHub connection, read/write the artifact bucket, start CodeBuild, and deploy objects to the website bucket. The regular build role needs artifact access and CloudWatch Logs. The invalidation build role additionally needs `cloudfront:CreateInvalidation` scoped to the exact distribution ARN, not `Resource: "*"` if resource scoping is supported. Do not grant `AdministratorAccess`, public S3 access, or personal AWS credentials to GitHub. Follow the exact action permissions in [the S3 deploy action reference](https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-S3Deploy.html) and [CodeBuild service-role guidance](https://docs.aws.amazon.com/codebuild/latest/userguide/setting-up-service-role.html).

15. **Check pipeline order and source filters.** The stages should be Source → Build → Deploy to S3 → Invalidate CloudFront. Verify the source event is tag push `v*`; do not select a default “any push” trigger if production must deploy only on a stable release tag. The `main` GitHub Actions CI workflow remains the PR/merge quality check; CodeBuild independently builds the tagged source before publishing. The release procedure below is the human gate that ensures only green `main` commits receive release tags.

16. **Release a stable version.** After merging the PR, wait for CI on `main` to pass. From a clean local checkout, create an annotated tag while on `main` and push that tag:

   ```powershell
   git switch main
   git pull --ff-only
   git status --short
   git tag -a v1.0.0 -m "MiloBroker public site 1.0.0"
   git push origin v1.0.0
   ```

   `git status --short` should show no changes. Check the tag is unused. A tag push matching `v*` starts CodePipeline, which builds that tagged source, deploys the static artifact, and invalidates CloudFront after S3 deployment. Never move or reuse release tags; publish a new patch tag for fixes.

17. **Verify the release.** In CodePipeline, confirm all stages succeeded and inspect CodeBuild logs if not. Confirm `index.html` and assets exist at the website bucket root, but the bucket objects remain private to direct public requests. Open `https://www.milobroker.com` in a browser, check assets/mobile layout, and click a WhatsApp link only to verify the prefilled recipient and text; do not send the message.

18. **Rollback a release.** Prefer a new fix commit and a new version tag. To restore a previous static bundle, rerun the pipeline using the old tag if the pipeline supports manual source revision selection; otherwise revert the Git change, merge it through normal CI, and create a new tag. If S3 bucket versioning is enabled, object versions can also be restored manually, followed by a CloudFront invalidation. Do not force-move a tag.

19. **Clean up when stopping the service.** Disable the CodePipeline trigger first. Then remove the pipeline and CodeBuild projects, delete the pipeline artifact bucket contents and bucket, empty and delete the website bucket, delete the CloudFront distribution, remove its BigRock DNS record, and remove unused ACM certificates and IAM roles/connections. CloudFront distributions take time to disable/delete. Check billing after cleanup; retained logs, versions, and artifacts may continue to cost money.

## Troubleshooting

- **GitHub connection unavailable:** finish the pending connection installation/authorization in AWS CodeConnections, then return to CodePipeline.
- **Pipeline starts on a normal branch push:** stop it and fix the source trigger to tag pushes `v*` before production use.
- **CodeBuild cannot find `package.json`:** ensure the CodePipeline source artifact is repository root and the buildspec path is correct.
- **S3 deploy puts files under `dist/`:** set CodeBuild artifact `base-directory: dist` and enable extraction in the S3 deploy action.
- **CloudFront returns 403:** confirm the bucket is private, OAC is attached, and the bucket policy references the right distribution ARN.
- **New site version is not visible:** confirm S3 deploy completed before invalidation, then check invalidation status and browser cache.
- **HTTPS certificate not selectable:** confirm the ACM certificate is **Issued** in `us-east-1` and includes the exact CloudFront hostname.

## Official documentation

- [AWS CodePipeline GitHub connections](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html)
- [CodePipeline Git tag trigger tutorial](https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-github-tags.html)
- [CodePipeline S3 deploy action](https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-S3Deploy.html)
- [AWS CodeBuild buildspec reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [CodeBuild service role](https://docs.aws.amazon.com/codebuild/latest/userguide/setting-up-service-role.html)
- [CloudFront OAC and private S3 origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [ACM public certificate request](https://docs.aws.amazon.com/acm/latest/userguide/acm-public-certificates.html)
- [CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/)
- [AWS Pricing Calculator](https://calculator.aws/)
