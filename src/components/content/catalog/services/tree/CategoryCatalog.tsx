/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { TagOutlined } from '@ant-design/icons';
import { Alert, Empty, Skeleton, Tooltip, Typography } from 'antd';
import { DataNode } from 'antd/es/tree';
import React from 'react';
import catalogStyles from '../../../../../styles/catalog.module.css';
import servicesEmptyStyles from '../../../../../styles/services-empty.module.css';
import { ApiError, Response, ServiceTemplateDetailVo } from '../../../../../xpanse-api/generated';
import { convertStringArrayToUnorderedList } from '../../../../utils/generateUnorderedList';
import {
    groupServiceTemplatesByName,
    groupServicesByVersionForSpecificServiceName,
} from '../../../common/catalog/catalogProps';
import { useAvailableServiceTemplatesQuery } from '../query/useAvailableServiceTemplatesQuery';
import { CatalogFullView } from './CatalogFullView';

function CategoryCatalog({ category }: { category: ServiceTemplateDetailVo.category }): React.JSX.Element {
    const treeData: DataNode[] = [];
    const { Paragraph } = Typography;
    let categoryOclData: Map<string, ServiceTemplateDetailVo[]> = new Map<string, ServiceTemplateDetailVo[]>();

    const availableServiceTemplatesQuery = useAvailableServiceTemplatesQuery(category);

    if (availableServiceTemplatesQuery.isSuccess && availableServiceTemplatesQuery.data.length > 0) {
        const userAvailableServiceList: ServiceTemplateDetailVo[] | undefined = availableServiceTemplatesQuery.data;
        categoryOclData = groupServiceTemplatesByName(userAvailableServiceList);
        categoryOclData.forEach((_value: ServiceTemplateDetailVo[], serviceName: string) => {
            const dataNode: DataNode = {
                title: (
                    <Tooltip placement='topLeft' title={serviceName}>
                        <Paragraph ellipsis={true} className={catalogStyles.catalogTreeNode}>
                            {serviceName}
                        </Paragraph>
                    </Tooltip>
                ),
                key: serviceName || '',
                children: [],
            };
            const versionMapper: Map<string, ServiceTemplateDetailVo[]> = groupServicesByVersionForSpecificServiceName(
                serviceName,
                userAvailableServiceList
            );
            versionMapper.forEach((_value: ServiceTemplateDetailVo[], versionName: string) => {
                dataNode.children?.push({
                    title: versionName,
                    key: serviceName + '@' + versionName,
                    icon: <TagOutlined />,
                });
            });
            treeData.push(dataNode);
        });
    }

    if (availableServiceTemplatesQuery.isError) {
        if (
            availableServiceTemplatesQuery.error instanceof ApiError &&
            availableServiceTemplatesQuery.error.body &&
            'details' in availableServiceTemplatesQuery.error.body
        ) {
            const response: Response = availableServiceTemplatesQuery.error.body as Response;
            return (
                <Alert
                    message={response.resultType.valueOf()}
                    description={convertStringArrayToUnorderedList(response.details)}
                    type={'error'}
                    closable={true}
                    className={catalogStyles.catalogSkeleton}
                />
            );
        } else {
            return (
                <Alert
                    message='Fetching Service Details Failed'
                    description={availableServiceTemplatesQuery.error.message}
                    type={'error'}
                    closable={true}
                    className={catalogStyles.catalogSkeleton}
                />
            );
        }
    }

    if (availableServiceTemplatesQuery.isLoading || availableServiceTemplatesQuery.isFetching) {
        return (
            <Skeleton
                className={catalogStyles.catalogSkeleton}
                active={true}
                loading={true}
                paragraph={{ rows: 2, width: ['20%', '20%'] }}
                title={{ width: '5%' }}
            />
        );
    }

    if (availableServiceTemplatesQuery.data && availableServiceTemplatesQuery.data.length === 0) {
        return (
            <div className={servicesEmptyStyles.serviceBlankClass}>
                <Empty description={'No services available.'} />
            </div>
        );
    }

    return (
        <div className={catalogStyles.catalogMiddleware}>
            <div className={catalogStyles.container}>
                <CatalogFullView treeData={treeData} categoryOclData={categoryOclData} category={category} />
            </div>
        </div>
    );
}

export default CategoryCatalog;
