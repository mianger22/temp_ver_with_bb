import * as react from 'react';
import styles from './tooth.less';
import ToothItemBottom from './ToothItemBottom';
import ToothItemTop from './ToothItemTop';
import { UserToothItem } from '@/pages/User/list/data';
import { AvailableListData } from '@/pages/directory/available/data';
import getTooths from '../Common/GetTooths';

export type ToothMapProps = {
    data: UserToothItem[],
    canEdit?: boolean,
    selected?: number[],
    selectFn?: (poistion: number, state: boolean) => boolean
    title?: string,
    onChange?: (position: number, available: string, helaths: any[], nerve: string) => void
    availables: AvailableListData[],
    healths: any[],
    nerves: any[],
    toothsDescription: object[],
    showTemporaryDescriptions: boolean,
    usId?: any,
    toothsHave?: string,
    selectedUser?: boolean,
    setSelectedUser?: any
}

let addedTooths: number = 0;
let intermediateData: any;
// метка, что админ находится на 2 этапе создания приёма
// let createCure: boolean = false;

let updatedCure: any;

const ToothMap: React.FC<ToothMapProps> = (props) => {  
    // alert("gggggg1111vvvv")  
    // console.clear();
    console.log("props in ToothMap:", props.toothsDescription);

    const alertlog = (codePart: string) => {
        // alert(codePart)
    }
  
    // react.useEffect(() => {
    //     return () => {
    //         alert("exited")
    //         localStorage.removeItem("updatedCure")
    //       }
    // })

    // как должен работать компонент

    // 1. наполняем массив данных заполлненной зубной картой

    const [toothMap, setToothMap] = react.useState(props.data);

    // react.useEffect(() => {
    // для этого - 
        // а) создаём хранилище
        // б) сам процесс замены

        if (props.toothsHave && props.toothsHave === "false" && localStorage.getItem("updatedCure") && updatedCure != localStorage.getItem("updatedCure")) {
            alertlog("0");
            // && addedTooths === 1) {
            // в) сохраняем промежуточный массив в store
            
            // alert("2");
            // console.clear();
            // console.log(" added first description ");
            // intermediateData = props.data;

            // сохраняем значение из хранлища в глобальную переменную для ограничения перезагрузок
            updatedCure = localStorage.getItem("updatedCure");

            // получаем объект из хранилища
            intermediateData = JSON.parse(updatedCure);

            setToothMap(intermediateData);
            // addedTooths = 2;            
        } else if (props.data == undefined) {
            alertlog("1");
            (async function() {
                // в) сохраняем промежуточный массив в store
                if (addedTooths === 0) {
                    // alert("1");
                    intermediateData = await getTooths(props.usId);
                    // console.log("intermediateData =", intermediateData)
                    setToothMap(intermediateData);
                    addedTooths = 1;
                }
            })();
        } else if (props.data != undefined && (props.data.length === 0 || props.data.filter((item: any) => item.health_ids.length === 0))) {
            alertlog("2");
           
            // data = [] || [{.. h_id: Ar(0)}, {.. h_id: Ar(0)}]
            
            (async function() {
                // в) сохраняем промежуточный массив в store
                // if (props.selectedUser === true && createCure === false) {
                if (props.selectedUser === true) {
                    // сейчас ошиька, что нам приходит один раз этот контроль, а надо чтоб каждый раз
                    alertlog("2-0");
                    intermediateData = await getTooths(props.usId);
                    // console.log("id:", props.usId, " / intermediateData =", intermediateData)
                    setToothMap(intermediateData);
                    
                    // createCure = true

                    // возвращаем метку в исхоное положение, чтобы блок срабатывал всякий раз, когда выбирают другого пациента
                    if (props.setSelectedUser) {
                        props.setSelectedUser(false);
                    }
                } 

                if (addedTooths === 0) {
                    alertlog("2-2");
                    intermediateData = await getTooths(props.usId);
                    // console.log("id:", props.usId, " / intermediateData =", intermediateData)
                    setToothMap(intermediateData);
                    addedTooths = 1;
                }
            })()
        } else if (props.data != undefined && props.data.filter((item: any) => item.health_ids.length > 0)) {
            // data = [{.. h_id: Ar(1)}, {.. h_id: Ar(0)}]
            alertlog("3");

            // в) сохраняем промежуточный массив в store
            if (addedTooths === 0) {
                // alert("3");
                intermediateData = props.data;
                setToothMap(intermediateData)
                addedTooths = 1
            }
        } 
//  }, [toothMap])
    // если зубкарта приходит без отмеченных зубов, то загружаем заполненную карту


    
        // setToothsHave(true)
        // setUserToothMap(vals.tooths);
    

    // остальной код

    const [avaliables] = react.useState<AvailableListData[]>(props.availables)
    const [healths] = react.useState(props.healths)
    const [nerves] = react.useState(props.nerves)
    // const [busy, setBusy] = react.useState(false)
    const [canEdit, _] = react.useState(props.canEdit)

    // порядок расположения зубов на плане лечения
    const firstTopList = [11, 12, 13, 14, 15, 16, 17, 18].reverse(),
         secondTopList = [21, 22, 23, 24, 25, 26, 27, 28],
       firstBottomList = [41, 42, 43, 44, 45, 46, 47, 48].reverse(),
      secondBottomList = [31, 32, 33, 34, 35, 36, 37, 38];

    return <div>
        <h2>{props.title || "Зубная карта"}</h2>
        <div className={styles.container}>
            <div className={styles.side}>
                {
                    firstTopList.map( item => <ToothItemTop
                        availables={avaliables}
                        healths={healths}
                        nerves={nerves}
                        canEdit={canEdit}
                        selectFn={props.selectFn}
                        selected={props.selected!.indexOf(item) > -1}
                        onChange={props.onChange}
                        item={toothMap && toothMap.find(x => x.position == item) as UserToothItem}
                        toothsDescription={props.toothsDescription} 
                        showTemporaryDescriptions={props.showTemporaryDescriptions}
                    /> )   
                }
                {
                    secondTopList.map( item => <ToothItemTop
                        availables={avaliables}
                        healths={healths}
                        nerves={nerves}
                        canEdit={canEdit}
                        selectFn={props.selectFn}
                        selected={props.selected!.indexOf(item) > -1}
                        onChange={props.onChange}
                        item={toothMap && toothMap.find(x => x.position == item) as UserToothItem} 
                        toothsDescription={props.toothsDescription} 
                        showTemporaryDescriptions={props.showTemporaryDescriptions}
                    /> ) 
                }
            </div>
            <div className={styles.side}>
                {
                    firstBottomList.map( item => <ToothItemBottom
                        availables={avaliables}
                        healths={healths}
                        nerves={nerves}
                        canEdit={canEdit}
                        selectFn={props.selectFn}
                        selected={props.selected!.indexOf(item) > -1}
                        onChange={props.onChange}
                        item={toothMap && toothMap.find(x => x.position == item) as UserToothItem} 
                        toothsDescription={props.toothsDescription} 
                        showTemporaryDescriptions={props.showTemporaryDescriptions}
                    /> ) 
                }
                {
                    secondBottomList.map( item => <ToothItemBottom
                        availables={avaliables}
                        healths={healths}
                        nerves={nerves}
                        canEdit={canEdit}
                        selectFn={props.selectFn}
                        selected={props.selected!.indexOf(item) > -1}
                        onChange={props.onChange}
                        item={toothMap && toothMap.find(x => x.position == item) as UserToothItem} 
                        toothsDescription={props.toothsDescription} 
                        showTemporaryDescriptions={props.showTemporaryDescriptions}
                    /> ) 
                }
            </div>
        </div>
    </div>
}

export default ToothMap;