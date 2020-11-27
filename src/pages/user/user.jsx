import React, { Component } from 'react'
import { Card, Button, Table, Modal, message } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { reqUsers, reqAddOrUpdateUser, reqDelUser } from '../../api/index'
import UserForm from './user-form'
import { formatDate } from "../../utils/dateUtils"
import LinkButton from '../../components/link-button'
import { PAGE_SIZE } from '../../utils/constants'
const { confirm } = Modal;
export default class User extends Component {
    state = {
        users: [],
        roles: [],
        isShow: false
    }
    initColumn = () => {
        this.columns = [
            {
                title: '用户名',
                dataIndex: 'username',
            },
            {
                title: '邮箱',
                dataIndex: 'email',
            },
            {
                title: '电话',
                dataIndex: 'phone'
            },
            {
                title: '注册时间',
                dataIndex: 'create_time',
                render: formatDate
            },
            {
                title: '所属角色',
                dataIndex: 'role_id',
                render: (role_id) => this.roleNames[role_id]
            },
            {
                title: '操作',
                render: (user) => (
                    <span>
                        <LinkButton onClick={()=>this.showUpdate(user)}>修改</LinkButton>
                        <LinkButton onClick={() => this.delUser(user)}>删除</LinkButton>
                    </span>
                )
            },
        ]
    }
    initRoleNames = (roles) => {
        const roleNames = roles.reduce((pre, role) => {
            pre[role._id] = role.name
            return pre
        }, {})
        this.roleNames = roleNames
    }
    getUsers = async () => {
        const result = await reqUsers()
        if (result.status === 0) {
            const { users, roles } = result.data
            this.initRoleNames(roles)
            this.setState({
                users,
                roles
            })
        }
    }
    showAdd=()=>{
        this.user=null
        this.setState({isShow:true})
    }
    showUpdate=(user)=>{
        this.user=user
        this.setState({isShow:true})
    }
    addOrUpdateUser = async () => {
        const user = this.form.form.current.getFieldsValue()
        this.form.form.current.resetFields()
        this.setState({
            isShow:false
        })
        if(this.user){
            user._id=this.user._id
        }
        const result = await reqAddOrUpdateUser(user)
        if (result.status === 0) {
            message.success(`${this.user?'修改':'添加'}用户成功！`)
            this.getUsers()
        }
    }
    delUser = async (user) => {
        confirm({
            title: `确认删除${user.username}吗?`,
            icon: <ExclamationCircleOutlined />,
            onOk:async()=> {
                const result = await reqDelUser(user._id)
                if (result.status === 0) {
                    message.success('删除成功！')
                    this.getUsers()
                }
            },
        });

    }
    componentWillMount() {
        this.initColumn();
    }
    componentDidMount() {
        this.getUsers();
    }
    render() {
        const { users, isShow, roles } = this.state
        const user=this.user||{}
        const title = <Button type='primary' onClick={this.showAdd}>创建用户</Button>
        return (
            <div>
                <Card title={title}>
                    <Table
                        bordered
                        rowKey='_id'
                        columns={this.columns}
                        dataSource={users}
                        pagination={{ defaultPageSize: PAGE_SIZE }}
                    />
                </Card>
                <Modal
                    title={user._id?'修改用户':'添加用户'}
                    visible={isShow}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.addOrUpdateUser}
                    onCancel={() => {
                        console.log(this.form)
                        this.form.form.current.resetFields()
                        this.setState({ isShow: false })
                    }
                    }
                >
                    <UserForm
                        ref={(form) => this.form = form}
                        roles={roles}
                        user={user}
                    />
                </Modal>
            </div>
        )
    }
}
