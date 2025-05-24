import React from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

const ProgressTracker = ({ currentStep }) => {
  return (
    <Steps current={currentStep}>
      <Step title="第一步" description="缴费指数计算" />
      <Step title="第二步" description="退休计划输入" />
      <Step title="第三步" description="计算退休金" />
    </Steps>
  );
};

export default ProgressTracker;