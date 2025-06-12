import React, { useEffect, useState, useContext } from 'react';
import { Space, Button, Typography, Divider } from 'antd';
import { LAST_YEAR_AVERAGE_SALARY, retirementMonthsMap } from '../constants.js';
import { ContributionIndexContext } from '../ContributionIndexContext';
import dayjs from 'dayjs';

const { Text } = Typography;

const Step3 = ({ onPrev }) => {
    const [personalPaymentTotal, setPersonalPaymentTotal] = useState(0);
    const [newPersonalAccountTotal, setNewPersonalAccountTotal] = useState(0);
    const [totalPaymentMonths, setTotalPaymentMonths] = useState(0);
    const [comprehensiveContributionIndex, setComprehensiveContributionIndex] = useState(0);
    const [personalAccountTotal, setPersonalAccountTotal] = useState(0);
    const [retirementMonths, setRetirementMonths] = useState(1);
    const { contributionIndex } = useContext(ContributionIndexContext);
    const [basePension, setBasePension] = useState(0);
    const [personalPension, setPersonalPension] = useState(0);
    const [expectedPension, setExpectedPension] = useState(0);

    const getPlanMonthsCount = (plan) => {
        const startDate = dayjs(plan.startDate, 'YYYY-MM');
        const endDate = dayjs(plan.endDate, 'YYYY-MM');
        return endDate.diff(startDate, 'month') + 1;
    };

    /*
    const getPlanYearsCount = (plan) => {
        const startDate = dayjs(plan.startDate, 'YYYY-MM');
        const endDate = dayjs(plan.endDate, 'YYYY-MM');
        return endDate.diff(startDate, 'year') + 1;
    };*/

    useEffect(() => {
        const pensionData = JSON.parse(localStorage.getItem('pensionData'));
        //setPensionData(pensionData);

        let { paymentPlans, accountTotal, totalYearsNumber, totalMonthsNumber, currentAge, plannedRetirementAge, shanghaiSalaryGrowthRate, pensionAccountInterestRate } = pensionData;

        // 个人付费总额计算
        let personalPaymentTotal = paymentPlans.reduce((sum, plan) => {
            const months = getPlanMonthsCount(plan);
            //这里按灵活就业时交20%来计算
            return sum + months * plan.contributionIndex * LAST_YEAR_AVERAGE_SALARY * 0.2;
        }, 0);

        setPersonalPaymentTotal(personalPaymentTotal);

        // 个人帐户新增总额计算
        let personalAccountIncreaseTotal = paymentPlans.reduce((sum, plan) => {
            let currentDate = dayjs(plan.startDate, 'YYYY-MM');
            const endDate = dayjs(plan.endDate, 'YYYY-MM');

            // 计算从 currentDate 到 endDate 的总月数
            const totalMonths = endDate.diff(currentDate, 'month') + 1;
            let remainingMonths = totalMonths;

            while (remainingMonths > 0) {
                const endOfYear = currentDate.endOf('year');
                const monthsToEndOfYear = Math.min(remainingMonths, endOfYear.diff(currentDate, 'month') + 1);
                const monthlyContribution = monthsToEndOfYear * plan.contributionIndex * LAST_YEAR_AVERAGE_SALARY * 0.08;
                const yearsToRetirement = (plannedRetirementAge - currentAge) - (currentDate.year() - new Date().getFullYear());
                const contributionGrowth = monthlyContribution * Math.pow((1 + pensionAccountInterestRate / 100), yearsToRetirement);
                sum += contributionGrowth;

                remainingMonths -= monthsToEndOfYear;
                currentDate = currentDate.add(1, 'year').startOf('year');
            }

            return sum;
        }, 0);

        // 原accountTotal的增值计算
        const accountTotalGrowth = accountTotal * (Math.pow((1 + pensionAccountInterestRate / 100), (plannedRetirementAge - currentAge)) - 1);

        // 新增个人帐户总额计算
        const newPersonalAccountTotal = personalAccountIncreaseTotal + accountTotalGrowth;
        setNewPersonalAccountTotal(newPersonalAccountTotal);

        // 总缴费月数计算
        const totalPaymentMonths = (totalYearsNumber * 12 + totalMonthsNumber) + paymentPlans.reduce((sum, plan) => {
            return sum + getPlanMonthsCount(plan);
        }, 0);
        setTotalPaymentMonths(totalPaymentMonths);

        // 综合缴费指数计算
        const comprehensiveContributionIndex = (contributionIndex * (totalYearsNumber * 12 + totalMonthsNumber) + paymentPlans.reduce((sum, plan) => {
            return sum + getPlanMonthsCount(plan) * plan.contributionIndex;
        }, 0)) / totalPaymentMonths;
        setComprehensiveContributionIndex(comprehensiveContributionIndex);

        // 个人账户总额计算
        const personalAccountTotal = accountTotal + newPersonalAccountTotal;
        setPersonalAccountTotal(personalAccountTotal);

        // 计发月数计算
        const retirementMonths = retirementMonthsMap[plannedRetirementAge];
        setRetirementMonths(retirementMonths);

        // 计算基本养老金
        const basePension = (1 + comprehensiveContributionIndex) / 2 * totalPaymentMonths / 12 * 0.01 * (LAST_YEAR_AVERAGE_SALARY * (1 + shanghaiSalaryGrowthRate / 100) ** (plannedRetirementAge - currentAge));
        setBasePension(basePension);

        // 计算个人养老金
        const personalPension = personalAccountTotal / retirementMonths;
        setPersonalPension(personalPension);

        // 计算预期养老金
        const expectedPension = basePension + personalPension;
        setExpectedPension(expectedPension);

    }, [contributionIndex]);

    return (
        <div style={{ margin: '20px' }}>
            <Text>新增个人帐户总额: {newPersonalAccountTotal.toFixed(2)}</Text><br />
            <Text>个人付费总额: {personalPaymentTotal.toFixed(2)}</Text><br />
            <Text>总缴费月数: {totalPaymentMonths}</Text><br />
            <Text>综合缴费指数: {comprehensiveContributionIndex.toFixed(8)}</Text><br />
            <Text>计发月数: {retirementMonths}</Text><br />
            <Text>个人账户总额: {personalAccountTotal.toFixed(2)}</Text><br />
            <Divider />
            <Text>基本养老金: {basePension.toFixed(2)}</Text><br />
            <Text>个人养老金: {personalPension.toFixed(2)}</Text><br />
            <Text>预期养老金: {expectedPension.toFixed(2)}</Text><br />
            <Divider />
            <Space>
                <Button onClick={onPrev}>返回 Step 2</Button>
            </Space>
        </div>
    );
};

export default Step3;
