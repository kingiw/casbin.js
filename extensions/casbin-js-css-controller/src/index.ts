import { Authorizer } from 'casbin.js'
import { Action } from './types'


class CSSController {    
    private targetDOMs : Element[] = [];
    private auth!: Authorizer;
    constructor(auth : Authorizer) {
        this.auth = auth;
    }

    public refresh(): void {
        const elementsArray = Array.from(document.getElementsByClassName("casbin"));
        for (let elements of Array.from(elementsArray)) {
        for (let className of Array.from(elements.classList)) {
                console.log(className);
            }
        }
    }
}