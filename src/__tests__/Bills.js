import { screen} from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Router from "../app/Router"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"

import Firestore from "../app/Firestore"



describe("Given :  Étant donné que je suis connecté en tant qu'employé", () => {
  describe("When : Quand je suis sur la page du tableau de bord mais qu'elle est en cours de chargement", () => {
    test("Then : Alors, la page de chargement devrait être rendue", () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe("Quand je suis sur la page du tableau de bord mais que le back-end envoie un message d'erreur", () => {
    test("Alors, la page d'erreur devrait être rendue", () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe("Quand je suis sur la page Factures", () => {
    test("Alors l'icône de la facture dans la disposition verticale doit être mise en surbrillance", () => {
      
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })

      // Mock local Storage sur window pour définir l'utilisateur connecté en tant qu'employé
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({type: "Employee"}));

    
      const pathname = ROUTES_PATH["Bills"] // return '#employee/bills'
      Object.defineProperty(window, "location", { value: { hash: pathname } })
      
      document.body.innerHTML = `<div id="root"></div>`
      Router()

      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBe(true)
    })

    test("Alors les factures doivent être classées du plus tôt au plus tard", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html

      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)

      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })


    describe("Quand je clique sur New Bill btn", () => {
      test("Alors Cela devrait rendre la nouvelle page de facture", () => {
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const html = BillsUI({ data: []})
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null

        const bills = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const handleClickNewBill = jest.fn(() => bills.handleClickNewBill)
        const newBillBtn = screen.getByTestId('btn-new-bill')

        newBillBtn.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillBtn)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy()
      })
    })


    describe(" Quand je clique sur l'icône oeil d'une facture", () => {
      test("Alors Une modal devrait s'ouvrir", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const html = BillsUI({ data: [bills[1]] })
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const firestore = null
        const billsClass = new Bills({
          document, onNavigate, firestore, localStorage: window.localStorage
        })

        const modale = document.getElementById("modaleFile")

        $.fn.modal = jest.fn(() => modale.classList.add('show'))
    
        const handleClickIconEye = jest.fn(() => billsClass.handleClickIconEye)
        const iconEye = screen.getByTestId('icon-eye')
    
        iconEye.addEventListener('click', handleClickIconEye)
    
        userEvent.click(iconEye)
        expect(handleClickIconEye).toHaveBeenCalled()
    
        expect(modale.classList).toContain('show')
      })
    })
  })
})

