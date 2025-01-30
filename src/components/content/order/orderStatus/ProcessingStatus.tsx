/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import React from 'react';
import submitResultStyles from '../../../../styles/submit-result.module.css';
import { DeployedServiceDetails, serviceDeploymentState, serviceHostingType } from '../../../../xpanse-api/generated';
import { convertMapToDetailsList } from '../../../utils/convertMapToDetailsList';
import { OperationType } from '../types/OperationType';

export const ProcessingStatus = ({
    response,
    operationType,
}: {
    response: DeployedServiceDetails | undefined;
    operationType: OperationType;
}): React.JSX.Element => {
    const errorMsg: string = 'Please contact service vendor for error details.';
    const endPointMap = new Map<string, string>();
    if (operationType === OperationType.Deploy) {
        if (response?.serviceDeploymentState === serviceDeploymentState.DEPLOYMENT_SUCCESSFUL) {
            if (response.deployedServiceProperties) {
                for (const key in response.deployedServiceProperties) {
                    endPointMap.set(key, response.deployedServiceProperties[key]);
                }
            }
            if (endPointMap.size > 0) {
                return (
                    <>
                        <span>{'Deployment Successful'}</span>
                        <div className={submitResultStyles.resultContainer}>
                            {convertMapToDetailsList(endPointMap, 'Endpoint Information')}
                        </div>
                    </>
                );
            } else {
                return <span>{'Deployment Successful'}</span>;
            }
        } else if (response?.serviceDeploymentState === serviceDeploymentState.DEPLOYMENT_FAILED) {
            return (
                <div>
                    <span>{'Deployment Failed.'}</span>
                    <div>
                        {response.serviceHostingType === serviceHostingType.SELF ? response.resultMessage : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Modify) {
        if (response?.serviceDeploymentState === serviceDeploymentState.MODIFICATION_SUCCESSFUL) {
            if (response.deployedServiceProperties) {
                for (const key in response.deployedServiceProperties) {
                    endPointMap.set(key, response.deployedServiceProperties[key]);
                }
            }
            if (endPointMap.size > 0) {
                return (
                    <>
                        <span>{'Modification Successful'}</span>
                        <div className={submitResultStyles.resultContainer}>
                            {convertMapToDetailsList(endPointMap, 'Endpoint Information')}
                        </div>
                    </>
                );
            } else {
                return <span>{'Modification Successful'}</span>;
            }
        } else if (response?.serviceDeploymentState === serviceDeploymentState.MODIFICATION_FAILED) {
            return (
                <div>
                    <span>{'Modification Failed.'}</span>
                    <div>
                        {response.serviceHostingType === serviceHostingType.SELF ? response.resultMessage : errorMsg}
                    </div>
                </div>
            );
        }
    }

    if (operationType === OperationType.Destroy) {
        if (response?.serviceDeploymentState === serviceDeploymentState.DESTROY_SUCCESSFUL) {
            return (
                <div>
                    <span>{'Destroyed Successfully'}</span>
                </div>
            );
        } else if (response?.serviceDeploymentState === serviceDeploymentState.DESTROY_FAILED) {
            return (
                <div>
                    <span>{'Destroyed Failed.'}</span>
                    <div>
                        {response.serviceHostingType === serviceHostingType.SELF ? response.resultMessage : errorMsg}
                    </div>
                </div>
            );
        }
    }
    return <></>;
};
