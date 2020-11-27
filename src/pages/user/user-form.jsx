import React, { Component } from 'react'
import {
    Form,
    Input,
    Select,
} from 'antd'

const Item = Form.Item
const Option = Select.Option

/*
用户添加和修改的form组件
 */
class UserForm extends Component {
    form = React.createRef()
    onFinish = values => {
        console.log(values)
    }
    render() {
        const { roles, user } = this.props
        const formItemLayout = {
            labelCol: { span: 4 },  // 左侧label的宽度
            wrapperCol: { span: 16 }, // 右侧包裹的宽度
        }

        return (
            <Form
                {...formItemLayout}
                ref={this.form}
                initialValues={{
                    username: user.username,
                    phone: user.phone,
                    email: user.email,
                    role_id: user.role_id
                }}
                onFinish={this.onFinish}
            >
                <Item
                    label="用户名"
                    name="username"
                    rules={[{ required: true, whitespace: true, message: '用户名必须输入' },
                    { min: 4, message: '用户名至少4位' },
                    { max: 12, message: '用户名最多12位' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名必须是英文、数字或下划线组成' },
                    ]}>
                    <Input placeholder='请输入用户名' />
                </Item>
                {user._id ? null : (
                    <Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '密码必须输入' }]}>
                        <Input placeholder='请输入密码' />
                    </Item>
                )}
                <Item
                    label="手机号"
                    name="phone"
                    rules={[{ required: true, message: '手机号必须输入' },
                    { pattern: /^1(3|4|5|6|7|8|9)d{9}$/, message: '手机号码有误' },
                    ]}>
                    <Input placeholder='请输入手机号' />
                </Item>
                <Item
                    label="邮箱"
                    name="email"
                    rules={[{ required: true, message: '邮箱必须输入' },
                    { pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, messasge: '邮箱格式有误' }]}>
                    <Input placeholder='请输入邮箱' />
                </Item>
                <Item
                    label="角色"
                    name="role_id">
                    <Select>
                        {
                            roles.map(role => <Option key={role._id} value={role._id}>{role.name}</Option>)
                        }
                    </Select>
                </Item>
            </Form>
        )

    }
}
export default UserForm