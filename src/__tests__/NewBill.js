import { screen, fireEvent } from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import firebase from "../__mocks__/firebase"
import { ROUTES } from "../constants/routes"

window.alert = jest.fn();

describe("Étant donné que je suis connecté en tant qu'employé", () => {
  describe("Quand je suis sur la page NewBill", () => {
    test("Alors il devrait rendre un formulaire New Bill", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillForm = screen.getByTestId('form-new-bill')
      expect(newBillForm).toBeTruthy()
    })

    test("Alors il devrait rendre 8 entrées", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const expenseTypeInput = screen.getByTestId('expense-type')
      expect(expenseTypeInput).toBeTruthy()

      const expenseNameInput = screen.getByTestId('expense-name')
      expect(expenseNameInput).toBeTruthy()

      const datePicker = screen.getByTestId('datepicker')
      expect(datePicker).toBeTruthy()

      const amountInput = screen.getByTestId('amount')
      expect(amountInput).toBeTruthy()

      const vatInput = screen.getByTestId('vat');
      expect(vatInput).toBeTruthy()

      const pctInput = screen.getByTestId('pct');
      expect(pctInput).toBeTruthy()

      const commentary = screen.getByTestId('commentary');
      expect(commentary).toBeTruthy()

      const fileInput = screen.getByTestId('file');
      expect(fileInput).toBeTruthy()
    })

    describe("Quand j'ajoute un fichier image comme preuve de facture", () => {
      test("Alors ce nouveau fichier aurait dû être modifié dans l'entrée", () => {
        Object.defineProperty(window, 'localStorage', { 
          value: localStorageMock 
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBills = new NewBill({
          document, 
          onNavigate, 
          firestore: null,  
          localStorage: window.localStorage
        })
  
        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile)
        const fileInput = screen.getByTestId('file')

        // https://github.com/testing-library/react-testing-library/issues/93#issuecomment-392126991
        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, { 
          target: { 
            files: [new File(['bill.png'], 'bill.png', {type: 'image/png'})]
          } 
        })
  
        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe('bill.png')
      })
    })

    describe("Quand j'ajoute un fichier non-image comme preuve de facture", () => {
      test("Alors lancer une alerte", () => {
        Object.defineProperty(window, 'localStorage', { 
          value: localStorageMock 
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const html = NewBillUI()
        document.body.innerHTML = html
  
        const newBills = new NewBill({
          document, 
          onNavigate, 
          firestore: null,  
          localStorage: window.localStorage
        })

        const handleChangeFile = jest.fn((e) => newBills.handleChangeFile)
        const fileInput = screen.getByTestId('file')
  
        // https://github.com/testing-library/react-testing-library/issues/93#issuecomment-392126991
        fileInput.addEventListener("change", handleChangeFile)
        fireEvent.change(fileInput, { 
          target: { 
            files: [new File(['video.mp4'], 'video.mp4', {type: 'video/mp4'})]
          } 
        })
  
        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalled()
      })
    })

    describe("Quand je soumets le formulaire", () => {
      test("Alors, je devrais être envoyé sur la page Factures", () => {
        Object.defineProperty(window, 'localStorage', { 
          value: localStorageMock 
        })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBills = new NewBill({
          document, 
          onNavigate, 
          firestore: null, 
          localStorage: window.localStorage
        })

        const handleSubmit = jest.fn((e) => newBills.handleSubmit)
        const newBillForm = screen.getByTestId('form-new-bill')
        newBillForm.addEventListener("submit", handleSubmit)

        fireEvent.submit(newBillForm)

        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})
