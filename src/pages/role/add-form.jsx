import React, { Component } from 'react'
import {
    Form,
    Input
} from 'antd'

const Item = Form.Item

/*
添加分类的form组件
 */
class AddForm extends Component {
    form = React.createRef()
    onFinish=values=>{
        console.log(values)
    }
    render() {
        return (
            <Form
                ref={this.form}
                initialValues={{
                    roleName: ''
                }}
                onFinish={this.onFinish}
            >
                <Item
                    label="角色名称"
                    name="roleName"
                    rules={[{ required: true, message: '角色名称必须输入' }]}>
                    <Input placeholder='请输入角色名称' />
                </Item>
            </Form>
        )

    }
}
export default AddForm