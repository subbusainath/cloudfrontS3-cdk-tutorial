#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CloudfrontS3CdkYoutubeStack } from '../lib/cloudfront_s3-cdk-youtube-stack';

const app = new cdk.App();
new CloudfrontS3CdkYoutubeStack(app, 'CloudfrontS3CdkYoutubeStack', {
});