import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { IconContext } from "react-icons";
import { BsChevronDown } from 'react-icons/bs';
import { RiCloseFill } from 'react-icons/ri';
import './style.scss';

const ConverterCard = () => {

    interface bitcoinObject {
        [name:string]: {
            code: string;
            description: string;
            rate: string;
            rate_float: number;
            symbol: string;
        }
    }

    interface amountObject {
        code: string;
        sum: string;
        active: boolean;
    }

    const [bitcoinAmount, setBitcoinAmount] = useState(0);

    const [bitcoinData, setBitcoinData] = useState<bitcoinObject>()
    const [amounts, setAmounts] = useState<Array<amountObject>>();

    const [inactiveEmpty, setInactiveEmpty] = useState(false);
    const [activeEmpty, setActiveEmpty] = useState(true);

    const [dropDown, setDropDown] = useState(false);

    const [focus, setFocus] = useState(false);

    useEffect(() => {
        //Fetch BTC exchange data from coindesk API
        const fetchData = async () => {
            try{
            const request = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
            setBitcoinData(request.data.bpi);
            }
            catch (error) {
                console.log(error);
            }
        }
        fetchData();

        //Fetch data every minute
        const interval = setInterval(() => {
            fetchData();
        }, 60000 );
      
        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        //Calculate exchange amounts if input or BTC data changes
        const calculateRates = () => {
            if(bitcoinData){
                let array: Array<amountObject> = [];
                Object.keys(bitcoinData).forEach((key,i) => {
                    let bitNum = +(bitcoinData[key].rate.replace(',',''));
                    let bitStr =  new Intl.NumberFormat('us-US', { style: 'currency', currency: bitcoinData[key].code }).format(bitcoinAmount*bitNum);
                    let state = false;
                    if(amounts){
                       state = amounts[i].active
                    }
                    array.push({code: bitcoinData[key].code, sum: bitStr, active: state});
                  });
                  setAmounts(array);
            }
        }
        calculateRates();
    }, [bitcoinAmount, bitcoinData])

    //Set active currency fields
    const setActive = (id:string) => {
        let placeholder: Array<amountObject> = [];
        let empty = true;
        amounts?.forEach((amount) => {
            if(amount.code === id){
                amount.active = true;
            }
            if(!amount.active) {
                empty = false;
            }
            placeholder.push(
                {
                    code: amount.code,
                    sum: amount.sum,
                    active: amount.active
                }
            )
        })
        setActiveEmpty(false);
        setDropDown(false);
        setInactiveEmpty(empty);
        setAmounts(placeholder);
    }

    //Deactivate currency fields
    const setInactive = (id:string) => {
        let placeholder: Array<amountObject> = [];
        let empty = true;
        amounts?.forEach((amount) => {
            if(amount.code === id){
                amount.active = false;
            }
            if(amount.active) {
                empty = false;
            }
            placeholder.push(
                {
                    code: amount.code,
                    sum: amount.sum,
                    active: amount.active
                }
            )
        })
        setInactiveEmpty(false);
        setActiveEmpty(empty);
        setAmounts(placeholder);
    }

    // Check input max length, set placeholder and state data
    const handleInput = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.value.length === 0){
            e.target.value = '0';
        } else if(
            (e.target.value.length > 1 && e.target.value.charAt(0) === '0' && e.target.value.charAt(1) !== '.')
             || e.target.value.charAt(0) === '-'){
            e.target.value = e.target.value.slice(1);
        }
        if (e.target.value.length > e.target.maxLength) {
            e.target.value = e.target.value.slice(0, e.target.maxLength)
        }
        setBitcoinAmount(+e.target.value);
    }

    return (
        <div className="card__container">
            <h1 className="card__title">Bitcoin keitykla</h1>
            <div className="card__top">
                <span className={`card__btc__symbol ${focus ? "green" : ""} unselectable`}>
                    &#8383;
                </span>
                <input
                    defaultValue={0}
                    maxLength={12}
                    onChange={e => handleInput(e)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    type="number" 
                />
            </div>
            <div className="card__currencies">
                {
                    inactiveEmpty ? (
                        <h3>Pasirinktos visos valiutos</h3>
                    ) : (
                        <div className="select__wrap">
                            <div className="select__box" onClick={() => setDropDown(prevState => !prevState)}>
                                <h1 className="unselectable">Pridėti valiutą</h1>
                                <IconContext.Provider value={{ className: `select__caret ${dropDown ? "active" : ""} unselectable` }}>
                                    <BsChevronDown />
                                </IconContext.Provider>
                            </div>
                            { dropDown && (
                            <div className="select__input__wrap">
                            {
                                amounts?.map((amount,i) => (
                                    (!amount.active) && (
                                        <span 
                                            key={i}
                                            className="select__item"
                                            onClick={() => setActive(amount.code)}
                                        >
                                            {amount.code}
                                        </span>
                                    )
                            ))}
                            </div>
                            )}
                        </div>
                    )
                }
                <div className="card__results">
                {
                    activeEmpty ? (
                        <p>Pasirinkite valiutą</p>
                    ) : (
                        <>
                            {amounts?.map((amount,i) => (
                                (amount.active) && (
                                    <div className="currency__wrap" key={i} >
                                        <div className="card__calculated">
                                            <span>{amount.sum}</span>
                                            <span
                                            className="currency__remove"
                                            onClick={() => setInactive(amount.code)}
                                            >
                                            <IconContext.Provider value={{ className: 'remove__icon' }}>
                                                <RiCloseFill />
                                            </IconContext.Provider>
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )
                }
                </div>
            </div>
        </div>
    )
}

export default ConverterCard
