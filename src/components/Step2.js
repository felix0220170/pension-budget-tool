import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Space, Button, message, Table, DatePicker, Divider } from 'antd';
import { useContext } from 'react';
import dayjs from 'dayjs';
import '@ant-design/v5-patch-for-react-19';

const { RangePicker } = DatePicker;
const DATE_FORMAT = 'YYYY-MM';


const Step2 = ({ onPrev, onNext }) => {
    const [form] = Form.useForm();
    const [paymentPlans, setPaymentPlans] = useState([]);

    // 从 localStorage 读取 Step1 的当前年龄
    const savedData = localStorage.getItem('pensionData');
    const parsedData = savedData ? JSON.parse(savedData) : {};
    const currentAge = parsedData.currentAge;

    function isOverlap(newPlan) {
        return paymentPlans.some(plan => {
            const existingStart = dayjs(plan.startDate, 'YYYY-MM').valueOf();
            const existingEnd = dayjs(plan.endDate, 'YYYY-MM').valueOf();
            const newStart = dayjs(newPlan.startDate, 'YYYY-MM').valueOf();
            const newEnd = dayjs(newPlan.endDate, 'YYYY-MM').valueOf();

            return (newStart >= existingStart && newStart <= existingEnd) ||
                (newEnd >= existingStart && newEnd <= existingEnd) ||
                (existingStart >= newStart && existingStart <= newEnd) ||
                (existingEnd >= newStart && existingEnd <= newEnd);
        });
    }

    // 提取设置默认日期范围的逻辑
    const setDefaultDateRange = () => {
        if (!form.getFieldValue('paymentPlanDateRange')) {
            const defaultStart = dayjs(getDefaultStartDate(), 'YYYY-MM');
            const defaultEnd = defaultStart.add(1, 'month');
            form.setFieldsValue({ paymentPlanDateRange: [defaultStart, defaultEnd] });
        }
    };

    // 提取添加新计划的逻辑
    const addNewPaymentPlan = (values) => {
        const [startDate, endDate] = values.paymentPlanDateRange;
        //console.log('startDate:', startDate);
        const newPlan = {
            // 生成唯一的 key
            key: Date.now(),
            startDate: startDate.format(DATE_FORMAT),
            endDate: endDate.format(DATE_FORMAT),
            contributionIndex: values.paymentPlanContributionIndex
        };
        if (isOverlap(newPlan)) {
            message.error('时间区间有重叠，请重新输入');
            return;
        }
        // 按开始日期升序排序 
        const newPaymentPlans = [...paymentPlans, newPlan].sort((a, b) =>
            dayjs(a.startDate, DATE_FORMAT) - dayjs(b.startDate, DATE_FORMAT)
        );
        setPaymentPlans(newPaymentPlans);
        const newStart = getNextMonthLastPlanEndDate(newPaymentPlans)
        form.setFieldsValue({
            paymentPlanDateRange: [newStart, newStart.add(1, 'month')]
        });
    };

    // 实现修改缴费计划的功能
    const [editingKey, setEditingKey] = useState('');

    const isEditing = (record) => record.key === editingKey;

    const editPlan = (record) => {
        setEditingKey(record.key);
        form.setFieldsValue({
            paymentPlanDateRange: [
                dayjs(record.startDate, DATE_FORMAT),
                dayjs(record.endDate, DATE_FORMAT)
            ],
            paymentPlanContributionIndex: record.contributionIndex
        });
    };

    const savePlan = (key) => {
        form.validateFields(['paymentPlanDateRange', 'paymentPlanContributionIndex'])
            .then(values => {
                const newPaymentPlans = paymentPlans.map(plan => {
                    if (plan.key === key) {
                        return {
                            ...plan,
                            startDate: values.paymentPlanDateRange[0].format(DATE_FORMAT),
                            endDate: values.paymentPlanDateRange[1].format(DATE_FORMAT),
                            contributionIndex: values.paymentPlanContributionIndex
                        };
                    }
                    return plan;
                });
                setPaymentPlans(newPaymentPlans);
                setEditingKey('');
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    // 修改 columns 数组，添加编辑按钮
    const columns = [
        { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
        { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
        { title: '缴费指数', dataIndex: 'contributionIndex', key: 'contributionIndex' },
        {
            title: '操作', key: 'action', render: (_, record, index) => {
                console.log(record);

                const editable = isEditing(record);
                console.log(editable);
                return editable ?
                    (<Space>
                        <Button type="primary" onClick={() => savePlan(record.key)}>保存</Button>
                        <Button onClick={() => setEditingKey('')}>取消</Button>
                    </Space>)
                    : (<Space>
                        <Button onClick={() => editPlan({ ...record })}>编辑</Button>
                        <Button onClick={() => removePaymentPlan(index)}>删除</Button></Space>);
            }
        }];

    const removePaymentPlan = (key) => {
        setPaymentPlans(paymentPlans.filter((_, index) => index !== key));
    };

    const validateContributionIndex = (rule, value) => {
        if (value === undefined || value === null) {
            return Promise.reject(new Error('请输入缴费指数'));
        }
        if (value < 0.6) {
            return Promise.reject(new Error('缴费指数不能小于 0.6'));
        }
        if (value > 3) {
            return Promise.reject(new Error('缴费指数不能大于 3'));
        }
        return Promise.resolve();
    };

    const getDefaultStartDate = () => {
        if (paymentPlans.length === 0) {
            return dayjs();
        }
        return getNextMonthLastPlanEndDate(paymentPlans);
    };

    const getNextMonthLastPlanEndDate = (plans) => {
        const lastPlanEndDate = dayjs(plans[plans.length - 1].endDate, DATE_FORMAT);
        return lastPlanEndDate.add(1, 'month');
    };

    const onFinish = (values) => {
        // 检查退休年龄是否小于 Step1 中的年龄
        if (values.plannedRetirementAge < currentAge) {
            message.error('计划退休年龄不能小于当前年龄');
            return;
        }

        // 合并 Step1 和 Step2 的数据
        const combinedData = {
            ...parsedData,
            ...values,
            paymentPlans
        };

        // 保存合并后的数据到 localStorage
        localStorage.setItem('pensionData', JSON.stringify(combinedData));

        onNext();
    };

    useEffect(() => {
        const savedData = localStorage.getItem('pensionData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log(parsedData);
            form.setFieldsValue(parsedData);
            setPaymentPlans(parsedData.paymentPlans || []);
        }


        form.setFieldsValue({
            paymentPlanDateRange: [getDefaultStartDate(), getDefaultStartDate().add(1, 'month')]
        });
    }, [form]);

    return (
        <div style={{ margin: '20px' }}>
            <Form
                form={form}
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
            >
                {/* 计划退休年龄输入框 */}
                <Form.Item name="plannedRetirementAge" label="计划退休年龄" rules={[{ required: true, message: '请输入计划退休年龄' }]}>
                    <InputNumber type="number" min={currentAge} />
                </Form.Item>
                {/* 预计上海社会平均工资年增长率输入框，默认值为 1% */}
                <Form.Item name="shanghaiSalaryGrowthRate" label="预计上海社会平均工资年增长率" initialValue={1} rules={[{ required: true, message: '请输入预计上海社会平均工资年增长率' }]}>
                    <InputNumber suffix="%" />
                </Form.Item>
                {/* 预计养老金账户记账利率输入框，默认值为 1% */}
                <Form.Item name="pensionAccountInterestRate" label="预计养老金账户记账利率" initialValue={1} rules={[{ required: true, message: '请输入预计养老金账户记账利率' }]}>
                    <InputNumber suffix="%" />
                </Form.Item>
                <Form.Item name="paymentPlanDateRange" label="缴费计划日期范围" rules={[{ required: true, message: '请选择日期范围' }]}>
                    <RangePicker format="YYYY-MM" picker="month" />
                </Form.Item>
                <Form.Item
                    name="paymentPlanContributionIndex"
                    label="缴费指数"
                    rules={[
                        { validator: validateContributionIndex }
                    ]}
                    initialValue={0.6}
                >
                    <InputNumber />
                </Form.Item>


                <Button type="primary" onClick={() => {
                    setDefaultDateRange();
                    form.validateFields(['paymentPlanDateRange', 'paymentPlanContributionIndex'])
                        .then(addNewPaymentPlan)
                        .catch(info => {
                            console.log('Validate Failed:', info);
                            message.error('表单验证失败，请检查输入内容');
                        });
                }}>
                    添加缴费计划
                </Button>
                <h4>&nbsp;</h4>
                <Table dataSource={paymentPlans} columns={columns} rowKey={(record, index) => index} />
                <Divider />
                <Space>
                    <Button onClick={onPrev}>返回 Step 1</Button>
                    <Button type="primary" htmlType="submit">下一步</Button>
                </Space>
            </Form>
        </div>
    );
};

export default Step2;
