import React, { Component } from 'react'
import { Card, Table, Button, Modal, message } from 'antd'
import { reqRoles, reqAddRole, reqUpdateRole } from '../../api/index'
import { PAGE_SIZE } from '../../utils/constants'
import AddForm from './add-form'
import AuthForm from './auth-form'
import { formatDate } from '../../utils/dateUtils'
import memoryUtils from '../../utils/memoryUtils'
import storageUtils from '../../utils/storageUtils'
import { RichUtils } from 'draft-js'

export default class Role extends Component {
    state = {
        roles: [],
        role: {},
        isShowAdd: false,
        isShowAuth: false, // 是否显示设置权限界面
    }
    auth = React.createRef()

    initColumn = () => {
        this.columns = [
            {
                title: '角色名称',
                dataIndex: 'name',
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (create_time) => formatDate(create_time)
            },
            {
                title: '授权时间',
                dataIndex: 'auth_time',
                render: formatDate
            },
            {
                title: '授权人',
                dataIndex: 'auth_name',
            },
        ]
    }
    getRoles = async () => {
        const result = await reqRoles()
        if (result.status === 0) {
            const roles = result.data
            this.setState({
                roles
            })
        }
    }
    onRow = (role) => {
        return {
            onClick: event => {
                console.log(role)
                this.setState({ role })
            }, // 点击行

        }
    }
    addRole = async () => {
        this.setState({
            isShowAdd: false
        })
        const { roleName } = this.form.form.current.getFieldsValue()
        const result = await reqAddRole(roleName)
        if (result.status === 0) {
            message.success('角色添加成功！')
            const role = result.data
            this.setState(state => ({
                roles: [...state.roles, role]
            }))
            this.form.form.current.resetFields()
        }
        else {
            message.error('角色添加失败！')
        }
    }
    updateRole = async () => {
        this.setState({
            isShowAuth: false
        })
        const role = this.state.role
        const menus = this.auth.current.getMenus()
        role.menus = menus
        role.auth_time = Date.now()
        role.auth_name = memoryUtils.user.username
        const result = await reqUpdateRole(role)
        if (result.status === 0) {
            if(role._id===memoryUtils.user.role_id){
                memoryUtils.user={}
                storageUtils.removeUser()
                this.props.history.replace('/login')
                message.success('当前用户角色权限修改了，请重新登录！')
            }else{
                message.success('设置角色权限成功！')
                this.setState({
                    roles: [...this.state.roles]
                })
            }   
        }
    }
    componentWillMount() {
        this.initColumn()
    }
    componentDidMount() {
        this.getRoles()
    }
    render() {
        const { roles, role, isShowAdd, isShowAuth } = this.state
        const title = (
            <span>
                <Button type='primary' onClick={() => this.setState({ isShowAdd: true })}>创建角色</Button>&nbsp;&nbsp;
                <Button type='primary' disabled={!role._id} onClick={() => this.setState({ isShowAuth: true })}>设置角色权限</Button>
            </span>

        )
        return (
            <div>
                <Card title={title}>
                    <Table
                        bordered
                        rowKey='_id'
                        columns={this.columns}
                        dataSource={roles}
                        pagination={{ defaultPageSize: PAGE_SIZE }}
                        rowSelection={{
                            type: 'radio',
                            selectedRowKeys: [role._id],
                            onSelect:(role)=>{//选择某个radio时回调
                                this.setState({
                                    role
                                })
                            }
                        }}
                        onRow={this.onRow}
                    />
                </Card>
                <Modal
                    title="添加角色"
                    visible={isShowAdd}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.addRole}
                    onCancel={() => {
                        this.setState({ isShowAdd: false })
                        this.form.form.current.resetFields()
                    }
                    }
                >
                    <AddForm
                        ref={(form) => this.form = form}
                    />
                </Modal>
                <Modal
                    title="添加角色权限"
                    visible={isShowAuth}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.updateRole}
                    onCancel={() => {
                        this.setState({ isShowAuth: false })
                    }
                    }
                >
                    <AuthForm ref={this.auth} role={role} />
                </Modal>
            </div>
        )
    }
}
