import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button, Table, Space, Tooltip, Drawer, message, Divider, InputNumber } from 'antd';
import { ContributionIndexContext } from '../ContributionIndexContext';
import { QuestionCircleOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { LAST_YEAR_AVERAGE_SALARY, retirementMonthsMap } from '../constants.js';

const Step1 = ({ onNext }) => {
    const [form] = Form.useForm();
    // 修改解构方式
    const { contributionIndex, setContributionIndex } = useContext(ContributionIndexContext);
    const [currentRetirementMonths, setCurrentRetirementMonths] = useState(null);
    const [drawerVisible, setDrawerVisible] = React.useState(false);

    // 从 localStorage 读取数据
    useEffect(() => {
        const savedData = localStorage.getItem('pensionData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            form.setFieldsValue(parsedData);
        }
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        form.setFieldsValue({
            retirementDate: `${year}-${month}`,
            lastYearAverageSalary: LAST_YEAR_AVERAGE_SALARY
        });
    }, [form]);

    const calculateContributionIndex = (values) => {
        const { currentAge, lastYearAverageSalary, totalYearsNumber, totalMonthsNumber, accountTotal, immediatePension } = values;
        // 将值转换为数字类型
        const numCurrentAge = Number(currentAge);
        const numLastYearAverageSalary = Number(lastYearAverageSalary);
        const numTotalYears = Number(totalYearsNumber);
        const numTotalMonths = Number(totalMonthsNumber);
        const numAccountTotal = Number(accountTotal);
        const numImmediatePension = Number(immediatePension);

        const retirementMonths = retirementMonthsMap[numCurrentAge];
        const totalYearsDecimal = numTotalYears + numTotalMonths / 12;
        const index = ((numImmediatePension - numAccountTotal / retirementMonths) * 100 * 2) / numLastYearAverageSalary / totalYearsDecimal - 1;
        setContributionIndex(index);
    };

    const onFinish = (values) => {
        // 检查所有输入框是否为空
        const isEmpty = Object.values(values).some(value => value === undefined || value === null || value === '');
        if (isEmpty) {
            // 这里使用导入的 message 组件
            message.error('请填写所有输入框');
            return;
        }
        calculateContributionIndex(values);
        // 保存数据到 localStorage
        let dataToSave = {
            totalYearsNumber: values.totalYearsNumber,
            totalMonthsNumber: values.totalMonthsNumber,
            accountTotal: values.accountTotal,
            immediatePension: values.immediatePension,
            currentAge: values.currentAge
        };
        const savedData = localStorage.getItem('pensionData');
        if (savedData) {
            dataToSave = {
                ...JSON.parse(savedData),
                ...dataToSave
            }
        }
        localStorage.setItem('pensionData', JSON.stringify(dataToSave));
    };

    // 清除输入框和 localStorage 的函数
    const clearFieldsAndStorage = () => {
        form.resetFields();
        localStorage.removeItem('pensionData');
    };

    const onAgeChange = (value) => {
        if (retirementMonthsMap[value]) {
            setCurrentRetirementMonths(retirementMonthsMap[value]);
        } else {
            setCurrentRetirementMonths(null);
        }
    };

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const onClose = () => {
        setDrawerVisible(false);
    };

    return (
        <div style={{ margin: '20px' }}>
            <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 600 }}>
                <Form.Item name="retirementDate" label="模拟计算退年月">
                    <Input style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="lastYearAverageSalary" label="上年月平均工资">
                    <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="全部工作年限">
                    <Space>
                        <Form.Item name="totalYearsNumber" noStyle>
                            <InputNumber type="number" placeholder="年" style={{ width: 'calc(50% - 8px)' }} />
                        </Form.Item>
                        <Form.Item name="totalMonthsNumber" noStyle>
                            <InputNumber type="number" placeholder="月" style={{ width: 'calc(50% - 8px)' }} />
                        </Form.Item>
                    </Space>
                </Form.Item>
                <Form.Item name="accountTotal" label="缴纳帐户存储总额">
                    <InputNumber type="number" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="immediatePension" label="立即退休的养老金">
                    <InputNumber type="number" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                    name="currentAge"
                    label={
                        <span>
                            当前年龄
                            <Tooltip title="用以计算计发月数">
                                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        </span>
                    }
                >
                    <InputNumber type="number" onChange={onAgeChange} style={{ width: '100%' }} min={40} max={70}/>
                </Form.Item>
                {currentRetirementMonths !== null && (
                    <div style={{marginBottom: '20px'}}>当前年龄对应的计发月数: {currentRetirementMonths}</div>
                )}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        计算当前缴费指数
                    </Button>
                    <Button style={{ marginLeft: 10 }} onClick={clearFieldsAndStorage}>
                        清除输入和存储
                    </Button>
                </Form.Item>
            </Form>
            {contributionIndex !== null && (
                <Space>
                    <div>当前缴费指数: {contributionIndex.toFixed(8)}</div>
                    <Button style={{ marginLeft: 10 }} onClick={() => {
                        onNext();
                    }}>
                        进入下一步
                    </Button>
                </Space>
            )}

            <Divider />
            {
            /* 
            <h2>计算缴费指数的方法</h2>
            <p>
                缴费指数 = （（立即退休的养老金 - 缴纳帐户存储总额 / 计发月数） * 100 * 2）/ 上年月平均工资 / 全部工作年限
            </p>
                */
            }
            <Button icon={<QuestionCircleOutlined />} onClick={showDrawer}>查看年龄和计发月数关系</Button>


            <Drawer
                title="年龄和计发月数关系"
                placement="right"
                onClose={onClose}
                visible={drawerVisible}
                width={400}
            >
                <Table
                    columns={[
                        { title: '年龄', dataIndex: 'age', key: 'age' },
                        { title: '计发月数', dataIndex: 'months', key: 'months' },
                    ]}
                    // 使用定义的 monthsMap 对象
                    dataSource={Object.entries(retirementMonthsMap).map(([age, months]) => ({ age, months }))}
                    size="small"
                />
            </Drawer>
        </div>
    );
};

export default Step1;