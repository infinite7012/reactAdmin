import React, { Component } from 'react'
import { Table, Card, Button, message, Modal } from 'antd'
import { reqCategorys, reqUpdateCategory, reqAddCategory } from '../../api'
import LinkButton from '../../components/link-button'
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import AddForm from './add-form'
import UpdateForm from './update-form'

export default class Category extends Component {
    state = {
        loading: false,//是否正在获取数据中
        categorys: [],//一级分类列表
        subCategorys: [],//二级分类列表
        parentId: '0',//当前需要显示的父列表的Id
        parentName: '',//当前需要显示的父列表的Name
        showStatus: 0,//分类的添加或修改显示状态：0：两者都不显示 1：显示添加分类模块 2：显示修改分类模块
    }

    //初始化Table标题
    initColumns = () => {
        this.columns = [
            {
                title: '分类的名称',
                dataIndex: 'name',//显示数据的对应属性名
            },
            {
                title: '操作',
                width: 300,
                render: (category) => (//返回需要显示的界面标签
                    <span>
                        <LinkButton onClick={() => this.showUpdate(category)}>修改分类</LinkButton>
                        {this.state.parentId === '0' ? <LinkButton onClick={() => { this.showSubCategorys(category) }}>查看子分类</LinkButton> : null}
                    </span>
                ),
            }
        ];
    }

    //Table信息获取
    getCategorys = async (parentId) => {

        // 在发请求前, 显示loading
        this.setState({ loading: true })
        parentId = parentId || this.state.parentId
        // 发异步ajax请求, 获取数据
        const result = await reqCategorys(parentId)
        // 在请求完成后, 隐藏loading
        this.setState({ loading: false })

        if (result.status === 0) {
            // 取出分类数组(可能是一级也可能二级的)
            const categorys = result.data
            if (parentId === '0') {
                // 更新一级分类状态
                this.setState({
                    categorys
                })
            } else {
                // 更新二级分类状态
                this.setState({
                    subCategorys: categorys
                })
            }
        } else {
            message.error('获取分类列表失败')
        }
    }

    //点击查看子分类，显示子分类内容
    showSubCategorys = (categorys) => {
        this.setState({
            parentId: categorys._id,
            parentName: categorys.name
        }, () => {
            this.getCategorys()
        })
    }

    //点击一级分类回退到一级分类
    showCategorys = () => {
        this.setState({
            parentId: '0',
            parentName: '',
            subCategorys: []
        })
    }

    //响应点击取消：隐藏框
    handleCancel = () => {
        this.formRef.formRef.current.resetFields()

        this.setState({ showStatus: 0 })
    }

    //修改分类ok按钮
    updateCategory = async () => {

        //1、隐藏确定
        this.setState({ showStatus: 0 })

        //删除原有信息
        // this.form.resetFields()

        //2、发请求更新分类
        const categoryId = this.category._id
        const { categoryName } = this.formRef.formRef.current.getFieldsValue()
        this.formRef.formRef.current.resetFields()
        const result = await reqUpdateCategory({categoryId, categoryName})
        if (result.status === 0) {
            //3、重新显示列表
            this.getCategorys()

        }
    }


    //添加ok按钮
    addCategory = async () => {

        // 隐藏确认框
        this.setState({
            showStatus: 0
        })

        // 收集数据, 并提交添加分类的请求
        const { parentId, categoryName } = this.formRef.formRef.current.getFieldsValue()
        // 清除输入数据
        this.formRef.formRef.current.resetFields()
        const result = await reqAddCategory(categoryName, parentId)
        if (result.status === 0) {

            // 添加的分类就是当前分类列表下的分类
            if (parentId === this.state.parentId) {
                // 重新获取当前分类列表显示
                this.getCategorys()
            } else if (parentId === '0') { // 在二级分类列表下添加一级分类, 重新获取一级分类列表, 但不需要显示一级列表
                this.getCategorys('0')
            }
        }
    }

    //点击添加按钮
    showAdd = () => {
        this.setState({ showStatus: 1 })
    }

    //点击修改按钮
    showUpdate = (category) => {
        // this.form.resetFields()
        this.category = category
        this.setState({ showStatus: 2 })
    }

    //为第一次render准备数据
    componentWillMount() {
        this.initColumns()
    }

    //第一次render后执行异步
    componentDidMount() {
        this.getCategorys()
    }


    render() {
        //Card的左侧标题
        const { categorys, loading, subCategorys, parentId, parentName, showStatus } = this.state
        //读取指定分类
        const category = this.category || {}
        const title = parentId === '0' ? '一级分类列表' : (
            <span>
                <LinkButton onClick={() => { this.showCategorys() }}>一级分类列表</LinkButton>
                <ArrowRightOutlined style={{ marginRight: 5 }} />
                <span>{parentName}</span>
            </span>
        )
        const extra = (
            <Button type="primary" icon={<PlusOutlined />} onClick={this.showAdd}>
                添加
            </Button>
        )
        return (
            <div>
                <Card title={title} extra={extra} >
                    <Table
                        bordered
                        rowKey='_id'
                        loading={loading}
                        dataSource={parentId === '0' ? categorys : subCategorys}
                        columns={this.columns}
                        pagination={{ defaultPageSize: 5, showQuickJumper: true }}
                    />
                </Card>
                <Modal
                    title="添加分类"
                    visible={showStatus === 1}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.addCategory}
                    onCancel={this.handleCancel}
                >
                    <AddForm
                        categorys={categorys}
                        parentId={parentId}
                        ref={(formRef) => { this.formRef = formRef }} />
                </Modal>
                <Modal
                    title="修改分类"
                    visible={showStatus === 2}
                    okText="确定"
                    cancelText="取消"
                    onOk={this.updateCategory}
                    onCancel={this.handleCancel}
                >
                    <UpdateForm
                        categoryName={category.name ? category.name : ''}
                        ref={(formRef) => { this.formRef = formRef }} />
                </Modal>
            </div>
        )
    }
}