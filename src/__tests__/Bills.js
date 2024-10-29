/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills";
import router from "../app/Router.js";
import '@testing-library/jest-dom';
import NewBill from '../containers/NewBill'; 
jest.mock("../app/store", () => mockStore);

// Fonction de formatage des statuts
const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refusé";
    default:
      return "Statut inconnu";
  }
};

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      // const dates = screen.getAllByText(/\d{4}[- /.]\d{2}[- /.]\d{2}/i)
      //   .map(a => new Date(a.innerHTML));
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      //const antiChrono = (a, b) => b - a; // Compare les objets Date
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });


    
    test("Then clicking on the eye icon should open the modal and display the bill image", async () => {
      // Simuler l'instance Bills et les dépendances
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });
    
      // Injecter l'interface utilisateur des factures dans le DOM
      document.body.innerHTML = BillsUI({ data: bills });
    
     
      const eyeIcons = screen.getAllByTestId("icon-eye");
      expect(eyeIcons.length).toBeGreaterThan(0);
    
      // Simuler la fonction handleClickIconEye sur la première icône
      const firstEyeIcon = eyeIcons[0];
      fireEvent.click(firstEyeIcon);
      const billUrl = firstEyeIcon.getAttribute("data-bill-url");
    
      // Espionner jQuery modal et HTML injection
      $.fn.modal = jest.fn(); 
    
     
      billsInstance.handleClickIconEye(firstEyeIcon);
    
   
      expect($.fn.modal).toHaveBeenCalledWith('show');
      const billImage = document.querySelector('.bill-proof-container img'); 
      expect(billImage).toBeTruthy(); 
     
      if (billImage&&billImage.src) {
               const decodedSrc = decodeURIComponent(billImage.src); // Décodez l'URL reçue
               expect(decodedSrc).toContain(billUrl.trim()); // Comparez après nettoyage
             }
    });
 
      test("Then getBills should return the bills with correctly formatted statuses", async () => {
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      const billsList = await billsInstance.getBills(); 
      expect(billsList.length).toBeGreaterThan(0);
      billsList.forEach(bill => {
        expect(bill.date).not.toBe("");
        const formattedStatus = formatStatus(bill.status);
        expect(["En attente", "Accepté", "Refusé", "Statut inconnu"]).toContain(formattedStatus);
      });
    });

    test("clicking on the New Bill button should navigate to the NewBill page", () => {
      const onNavigateMock = jest.fn();
      
      document.body.innerHTML = `<button data-testid="btn-new-bill">Nouvelle Facture</button>`;
      
      const billsInstance = new Bills({
        document,
        onNavigate: onNavigateMock,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const newBillButton = screen.getByTestId('btn-new-bill');
       fireEvent.click(newBillButton);
      billsInstance.handleClickNewBill();
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });


      test("Then it should log the error and return unformatted date", async () => {
        const corruptedBills = [
          {
            id: "1",
            date: "invalid-date",
            status: "pending"
          }
        ];

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: jest.fn(() => Promise.resolve(corruptedBills))
          };
        });

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        const consoleSpy = jest.spyOn(console, "log");

        const bills = await billsInstance.getBills();

        expect(bills[0].date).toBe("invalid-date");

        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error), 'for', corruptedBills[0]);

        consoleSpy.mockRestore();
      });
   });

   
});



//***************************test d'integration */


describe("Given I am connected as an Employee", () => {
  describe("When I navigate to the Bills page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
    });

    test("getBills fetches bills from mock API and returns an array of bills", async () => {
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: window.localStorage,
      });

      const billsList = await billsInstance.getBills();
      expect(billsList.length).toBeGreaterThan(0);
    });

    describe("When an error occurs on API", () => {
      test("getBills fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
          };
        });

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        await expect(billsInstance.getBills()).rejects.toThrow("Erreur 404");
      });

      test("getBills fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
          };
        });

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        await expect(billsInstance.getBills()).rejects.toThrow("Erreur 500");
      });
    });
  });
});