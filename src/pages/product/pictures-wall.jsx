import React from 'react';
import { Upload, Modal, message } from 'antd';
import PropTypes from 'prop-types'
import { PlusOutlined } from '@ant-design/icons';
import { reqDeleteImg } from '../../api/index'
import {BASE_IMG_URL} from '../../utils/constants'

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default class PicturesWall extends React.Component {
    static propTypes={
        imgs:PropTypes.array
    }
    state = {
        previewVisible: false, // 标识是否显示大图预览Modal
        previewImage: '', // 大图的url 
        previewTitle: '',
        fileList: [

        ],
    };
    constructor(props) {
        super(props)
        let fileList = []
        const { imgs } = this.props
        if (imgs && imgs.length > 0) {
            fileList = imgs.map((img, index) => ({
                uid: -index, // 每个file都有自己唯一的id
                name: img, // 图片文件名
                status: 'done', // 图片状态: done-已上传, uploading: 正在上传中, removed: 已删除
                url: BASE_IMG_URL + img
            }))
        }
        this.state = {
            previewVisible: false, // 标识是否显示大图预览Modal
            previewImage: '', // 大图的url
            fileList // 所有已上传图片的数组
        }
    }

    getImgs = () => {
        return this.state.fileList.map(file => file.name)
    }
    /*
      隐藏Modal
       */
    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };
    /*
      file: 当前操作的图片文件(上传/删除)
      fileList: 所有已上传图片文件对象的数组
       */
    handleChange = async ({ file, fileList }) => {
        if (file.status === 'done') {
            const result = file.response
            if (result.status === 0) {
                message.success('图片上传成功！')
                const { name, url } = result.data
                file = fileList[fileList.length - 1]
                file.name = name
                file.url = url
            } else {
                message.success('图片上传失败')
            }
        } else if (file.status === 'removed') {
            const result = await reqDeleteImg(file.name)
            if (result.status === 0) {
                message.success('删除图片成功！')
            }
            else {
                message.error('删除图片失败！')
            }
        }

        this.setState({ fileList });
    }

    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;
        const uploadButton = (
            <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </div>
        );
        return (
            <>
                <Upload
                    action="/manage/img/upload" /*上传图片的接口地址*/
                    accept='image/*'  /*只接收图片格式*/
                    name='image' /*请求参数名*/
                    listType="picture-card"  /*卡片样式*/
                    fileList={fileList}  /*所有已上传图片文件对象的数组*/
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                >
                    {fileList.length >= 4 ? null : uploadButton}
                </Upload>
                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </>
        );
    }
}

