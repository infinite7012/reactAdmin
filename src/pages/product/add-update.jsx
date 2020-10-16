import React, { Component } from 'react'
import {
    Input,
    Card,
    Form,
    Button,
    Cascader,
    message
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons';
import LinkButton from '../../components/link-button'
import { reqCategorys, reqAddOrUpdateProduct } from '../../api/index'
import PicturesWall from './pictures-wall'
import RichTextEditor from './rich-text-editor'
const { Item } = Form;
const { TextArea } = Input


export default class ProductAddUpdate extends Component {
    state = {
        options: [],
    };
    constructor(props) {
        super(props)
        //创建用来保存ref标识的标签对象的容器
        this.pw = React.createRef()
        this.detail = React.createRef()
    }
    getCategory = async (parentId) => {
        const result = await reqCategorys(parentId)
        if (result.status === 0) {
            const categorys = result.data
            if (parentId === '0') {
                this.initOptions(categorys)
            }
            else {
                return categorys
            }
        }
    }
    initOptions = async (categorys) => {
        const options = categorys.map(c => ({
            value: c._id,
            label: c.name,
            isLeaf: false,
        }))

        const { isUpdate, product } = this
        const { pCategoryId } = product
        if (isUpdate && pCategoryId !== '0') {
            // 获取对应的二级分类列表
            const subCategorys = await this.getCategory(pCategoryId)
            // 生成二级下拉列表的options
            const childOptions = subCategorys.map(c => ({
                value: c._id,
                label: c.name,
                isLeaf: true
            }))
            const targetOption = options.find(option => option.value === pCategoryId)
            targetOption.children = childOptions
        }

        this.setState({ options })
    }
    loadData = async selectedOptions => {
        const targetOption = selectedOptions[0];
        targetOption.loading = true;
        const subCategorys = await this.getCategory(targetOption.value)
        targetOption.loading = false;
        if (subCategorys && subCategorys.length > 0) {
            const childCategorys = subCategorys.map(c => ({
                value: c._id,
                label: c.name,
                isLeaf: true,
            }))
            targetOption.children = childCategorys
        } else {
            targetOption.isLeaf = true
        }
        this.setState({
            options: [...this.state.options],
        });
    };

    onFinish = async (value) => {
        const { name, desc, price, categoryIds } = value
        let pCategoryId, categoryId
        if (categoryIds.length === 1) {
            pCategoryId = '0'
            categoryId = categoryIds[0]
        }
        else {
            pCategoryId = categoryIds[0]
            categoryId = categoryIds[1]
        }
        const imgs = this.pw.current.getImgs()
        const detail = this.detail.current.getDetail()
        const product = { name, desc, price, imgs, detail, pCategoryId, categoryId }
        // 如果是更新, 需要添加_id
        if (this.isUpdate) {
            product._id = this.product._id
        }
        // 2. 调用接口请求函数去添加/更新
        const result = await reqAddOrUpdateProduct(product)
        // 3. 根据结果提示
        if (result.status === 0) {
            message.success(`${this.isUpdate ? '更新' : '添加'}商品成功！`)
            this.props.history.goBack()
        }
        else {
            message.error(`${this.isUpdate ? '更新' : '添加'}商品失败！`)
        }
    }
    validatePrice = (rule, value, callback) => {
        if (value * 1 > 0) {
            callback()
        } else {
            callback('价格必须大于0')
        }
    }
    componentDidMount() {
        this.getCategory('0')
    }
    componentWillMount() {
        const product = this.props.location.state
        this.isUpdate = !!product
        this.product = product || {}
    }
    render() {
        const { isUpdate, product } = this
        const { pCategoryId, categoryId, imgs, detail } = product        // 指定Item布局的配置对象
        const categoryIds = []
        if (isUpdate) {
            if (pCategoryId === '0') {
                categoryIds.push(pCategoryId)
            }
            categoryIds.push(pCategoryId)
            categoryIds.push(categoryId)
        }
        const formItemLayout = {
            labelCol: { span: 2 },  // 左侧label的宽度
            wrapperCol: { span: 8 }, // 右侧包裹的宽度
        }
        const title = (
            <span>
                <LinkButton onClick={() => this.props.history.goBack()}>
                    <ArrowLeftOutlined />
                </LinkButton>
                <span>{isUpdate ? '修改商品' : '添加商品'}</span>
            </span>
        )
        return (
            <Card title={title}>
                <Form
                    initialValues={{
                        name: product.name,
                        desc: product.desc,
                        price: product.price,
                        categoryIds: categoryIds
                    }}
                    onFinish={this.onFinish}
                    {...formItemLayout}
                >
                    <Item
                        label="商品名称"
                        name="name"
                        rules={[{ required: true, message: '必须输入商品名称！' }]}>
                        <Input placeholder='请输入商品名称' />
                    </Item>
                    <Item
                        label="商品描述"
                        name="desc"
                        rules={[{ required: true, message: '必须输入商品描述！' }]}>
                        <TextArea placeholder='请输入商品描述' autosize={{ minRows: 2, maxRows: 6 }} />
                    </Item>
                    <Item
                        label="商品价格"
                        name="price"
                        rules={[
                            { required: true, message: '必须输入商品价格！' },
                            { validator: this.validatePrice }]}>
                        <Input placeholder='请输入商品价格' addonAfter="元" />
                    </Item>
                    <Item
                        label="商品分类"
                        name="categoryIds"
                        rules={[{ required: true, message: '必须输入商品分类！' }]}>
                        <Cascader
                            placeholder='请指定商品分类'
                            options={this.state.options}
                            loadData={this.loadData}
                        />
                    </Item>
                    <Item label="商品图片">
                        <PicturesWall ref={this.pw} imgs={imgs} />
                    </Item>
                    <Item
                        label="商品详情"
                        labelCol={{ span: 2 }}
                        wrapperCol={{ span: 20 }}>
                        <RichTextEditor ref={this.detail} detail={detail} />
                    </Item>
                    <Item>
                        <Button type='primary' htmlType="submit">确定</Button>
                    </Item>
                </Form>
            </Card>
        )
    }
}
