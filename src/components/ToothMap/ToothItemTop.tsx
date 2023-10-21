import { AvailableListData } from '@/pages/directory/available/data';
import { HealthListItem } from '@/pages/directory/health/data';
import { NerveListItem } from '@/pages/directory/nerve/data';
import { UserToothItem } from '@/pages/User/list/data';
import React, { useEffect, useState } from 'react';
import styles from './tooth.less'
import classNames from 'classnames';
import ToothEdit from './ToothEdit';
import { Tooltip } from 'antd';

export type ToothItemProps = {
    item: UserToothItem
    availables: AvailableListData[],
    healths: HealthListItem[],
    nerves: NerveListItem[],
    canEdit?: boolean,
    selectFn?: (position: number, state: boolean) => boolean
    selected?: boolean,
    onChange?: (position: number, available: string, helaths: any[], nerve: string) => void,
    toothsDescription: any,
    showTemporaryDescriptions: boolean
}

const ToothItemTop: React.FC<ToothItemProps> = (props) => {    
    const [modalVisible, setVisible] = useState(false)
    const [canEdit, _] = useState(props.canEdit === true)
    const [selected, setSelected] = useState(props.selected === true)
    const [available, setAvailable] = useState<AvailableListData>({
        img: "",
        id: "",
        description: "",
        name: ""
    })
    const [nerve, setNerve] = useState<NerveListItem>({
        img: "",
        id: "",
        description: "",
        name: ""
    })
    const [healths, setHealths] = useState<string[]>([])
    const [healthImgs, setHealthImgs] = useState<(JSX.Element | undefined)[]>([])
    const [ite, setItem] = useState<UserToothItem>({ position: 0, available_id: "", nerve_id: "", health_ids: [] })
    const [tooltip, setTooltip] = useState<string | null>(null)

    useEffect(() => {
        let v = props.item;
        let descList = props.toothsDescription;

        if (v && v.position && descList && props.showTemporaryDescriptions === true) {
            // сохраняем нужное описание
            const tooth = descList.find((el: any) => el.position === v.position)
            
            if (tooth) {
                setTooltip(`${tooth.description}, ${v.available_id}`);
            }
        }

        if (!props.item) {
            v = { position: 0, available_id: "", nerve_id: "", health_ids: [] }
        }

        setItem(v)

        if (v.position > 0) {
            var s = props.availables.find(x => x.id == v.available_id)

            if (s != null) {
                setAvailable(s)
            }
        }

        s = props.nerves.find(x => x.id == v.nerve_id)

        if (s != null) {
            setNerve(s)
        }

        setHealths(v.health_ids)
    }, [props])
    
    useEffect(() => {
        const availableDesc = props.availables && props.item && props.availables.find(el => el.id === props.item.available_id);
        const nerveDesc = props.nerves && props.item && props.nerves.find(el => el.id === props.item.nerve_id);
        
        if (availableDesc?.name && availableDesc.name.length > 2) {
            setTooltip(`${availableDesc?.name}`);
        }

        if (nerveDesc?.name && nerveDesc.name.length > 2) {
            setTooltip(`${nerveDesc?.name}`);
        }

        const s = healths.map((x: string, position: number) => {
            const health = props.healths.find((j: HealthListItem) => {
                return j.id == x
            })

            if (health != undefined) {
                if (health.description) {
                    setTooltip(`${health?.description}, ${availableDesc?.name}, ${nerveDesc?.name}`);
                }

                return <img src={health?.img} key={health.id} style={{ zIndex: position }} />
            }

            return undefined
        })

        setHealthImgs(s)
    }, [healths])

    const itemClasses = classNames({
        [styles.item]: true,
        [styles.can_edit]: canEdit
    })

    const selectedMark = classNames({
        [styles.number]: true,
        [styles.selected]: props.showTemporaryDescriptions === true && selected
    })

    return (
        <Tooltip placement="top" title={tooltip && tooltip}>
            <div>
                <div
                    className={itemClasses}
                    onClick={() => {
                        if (canEdit) {
                            setVisible(canEdit)
                        } else {
                            if (props.selectFn) {
                                props.selectFn!(ite.position, !selected)
                                setSelected(!selected)
                            }
                        }
                    }}
                >
                    <div className={styles.nerve}><img src={`${nerve.img}`} /></div>
                    <div className={styles.available}><img src={`${available.img}`} /></div>
                    <div className={styles.health}>
                        {healthImgs}
                    </div>
                </div>
                <div className={selectedMark}>{ite.position}</div>
                <ToothEdit
                    availables={props.availables}
                    nerves={props.nerves}
                    healths={props.healths}
                    localtion="top"
                    onFinish={async (values: any) => {
                        setNerve(props.nerves.find(x => x.id == values.nerve_id) as NerveListItem);
                        setAvailable(props.availables.find(x => x.id == values.available_id) as AvailableListData);
                        setHealths(values.health_ids);

                        if (props.onChange) {
                            props.onChange(
                                ite.position,
                                values.available_id,
                                values.health_ids,
                                values.nerve_id
                            )
                        }

                        return true;
                    }}
                    item={ite}
                    visible={modalVisible}
                    onVisisbleChange={setVisible}
                />
            </div>
        </Tooltip>
    )
}

export default ToothItemTop;