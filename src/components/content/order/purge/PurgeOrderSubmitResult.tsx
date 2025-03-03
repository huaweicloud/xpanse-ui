/*
 * SPDX-License-Identifier: Apache-2.0
 * SPDX-FileCopyrightText: Huawei Inc.
 */

import { Alert } from 'antd';
import React from 'react';
import submitAlertStyles from '../../../../styles/submit-alert.module.css';
import { ServiceProviderContactDetails } from '../../../../xpanse-api/generated';
import { ContactDetailsShowType } from '../../common/ocl/ContactDetailsShowType';
import { ContactDetailsText } from '../../common/ocl/ContactDetailsText';
import OrderSubmitResultDetails from '../orderStatus/OrderSubmitResultDetails';

export const PurgeOrderSubmitResult = ({
    msg,
    serviceId,
    orderId,
    type,
    onClose,
    contactServiceDetails,
}: {
    msg: string | React.JSX.Element;
    serviceId: string;
    orderId: string;
    type: 'success' | 'error';
    onClose: () => void;
    contactServiceDetails: ServiceProviderContactDetails | undefined;
}): React.JSX.Element => {
    return (
        <div className={submitAlertStyles.submitAlertTip}>
            {' '}
            <Alert
                message={`Processing Status`}
                description={<OrderSubmitResultDetails msg={msg} serviceId={serviceId} orderId={orderId} />}
                showIcon
                closable={true}
                onClose={onClose}
                type={type}
                action={
                    <>
                        {contactServiceDetails !== undefined ? (
                            <ContactDetailsText
                                serviceProviderContactDetails={contactServiceDetails}
                                showFor={ContactDetailsShowType.Order}
                            />
                        ) : (
                            <></>
                        )}
                    </>
                }
            />{' '}
        </div>
    );
};
