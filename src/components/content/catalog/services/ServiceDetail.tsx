/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { Descriptions, Divider, Space, Tag } from 'antd';
import { CloudUploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { OclDetailVo } from '../../../../xpanse-api/generated';
import { Area } from '../../../utils/Area';

function ServiceDetail({
    serviceDetails,
    serviceAreas,
}: {
    serviceDetails: OclDetailVo;
    serviceAreas: Area[];
}): JSX.Element {
    return (
        <>
            <div className={'catalog-detail-class'}>
                <h3>
                    <CloudUploadOutlined />
                    &nbsp;Available Regions
                </h3>
                <Space size={[0, 8]} wrap>
                    {serviceAreas.map((area) => (
                        <Tag color='orange'>
                            {area.name}:&nbsp;{area.regions.join(', ')}
                        </Tag>
                    ))}
                </Space>
                <Divider />
            </div>
            <h3>
                <InfoCircleOutlined />
                &nbsp;Basic Information
            </h3>
            <Descriptions bordered column={1}>
                <Descriptions.Item label='Description' labelStyle={{ width: '230px' }}>
                    {serviceDetails.description}
                </Descriptions.Item>
                <Descriptions.Item label='Category'>{serviceDetails.category}</Descriptions.Item>
                <Descriptions.Item label='Provider'>{serviceDetails.cloudServiceProvider.name}</Descriptions.Item>
                <Descriptions.Item label='Service Version'>{serviceDetails.serviceVersion}</Descriptions.Item>
                <Descriptions.Item label='Billing Mode'>{serviceDetails.billing.model}</Descriptions.Item>
                <Descriptions.Item label='Register Time'>{serviceDetails.createTime.toUTCString()}</Descriptions.Item>
                <Descriptions.Item label='Update Time'>
                    {serviceDetails.lastModifiedTime.toUTCString()}
                </Descriptions.Item>
                <Descriptions.Item label='Status'>{serviceDetails.serviceState}</Descriptions.Item>
                <Descriptions.Item label='Flavors'>
                    {serviceDetails.flavors
                        .map((flavor) => {
                            return flavor.name;
                        })
                        .join(',')}
                </Descriptions.Item>
            </Descriptions>
        </>
    );
}

export default ServiceDetail;
