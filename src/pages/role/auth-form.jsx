import React, { Component } from 'react'
import {
    Form,
    Input,
    Tree
} from 'antd'
import menuList from '../../config/menuConfig'

const Item = Form.Item

export default class AuthForm extends Component {
    constructor(props){
        super(props);
        const {menus}=this.props.role
        this.state={
            checkedKeys:menus
        }
    }
    getMenus=()=>this.state.checkedKeys
    onCheck = checkedKeys => {
        console.log('onCheck', checkedKeys);
        this.setState({ checkedKeys });
    };
    getTreeList = (menuList) => {
        return menuList.reduce((pre, item) => {
            item.children ? pre.push(
                {
                    title: item.title,
                    key: item.key,
                    children: item.children.reduce((cPre, cItem) => {
                        cPre.push({
                            title: cItem.title,
                            key: cItem.key,
                        })
                        return cPre
                    }, [])
                }
            ) : pre.push({
                title: item.title,
                key: item.key,
            })
            return pre
        }, [])
    }
    componentWillMount() {
        this.treeData = this.getTreeList(menuList)
    }
    componentWillReceiveProps(nextProps){
        const menus=nextProps.role.menus
        this.setState({
            checkedKeys:menus
        })
    }
    render() {
        const { role } = this.props
        const { checkedKeys } = this.state
        return (
            <div>
                <Item label="角色名称">
                    <Input value={role.name} disabled />
                </Item>
                <Tree
                    checkable
                    defaultExpandAll={true}
                    onCheck={this.onCheck}
                    checkedKeys={checkedKeys}
                    treeData={this.treeData}
                />
            </div>
        )
    }
}
