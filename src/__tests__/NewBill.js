/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js"; 
import mockStore from "../__mocks__/store";
import { ROUTES_PATH } from '../constants/routes.js';
import router from "../app/Router.js";
import store from "../__mocks__/store";
import NewBill from "../containers/NewBill.js";

// Mock du store
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      // Mock du localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

      // Créer le DOM pour la page NewBill
      document.body.innerHTML = NewBillUI();
    });

    // Test pour vérifier si le formulaire et ses champs sont bien rendus
    test("Then the form and its fields should be rendered", () => {
      const form = screen.getByTestId("form-new-bill");
      expect(form).toBeTruthy();  // Vérifie que le formulaire est présent

      // Vérifier les champs principaux du formulaire
      expect(screen.getByTestId("expense-type")).toBeTruthy();  
      expect(screen.getByTestId("expense-name")).toBeTruthy();  
      expect(screen.getByTestId("datepicker")).toBeTruthy();    
      expect(screen.getByTestId("amount")).toBeTruthy();        
      expect(screen.getByTestId("vat")).toBeTruthy();           
      expect(screen.getByTestId("pct")).toBeTruthy();           
      expect(screen.getByTestId("commentary")).toBeTruthy();   
      expect(screen.getByTestId("file")).toBeTruthy();          
    });
    
    // Test pour vérifier que la soumission du formulaire avec des données valides appelle updateBill
    test("When submitting the form with valid data, it should call the updateBill function", async () => {
      const newBillInstance = new NewBill({
        document,
        onNavigate: jest.fn(),
        store,
        localStorage: window.localStorage,
      });

      // Mock de la fonction updateBill
      const updateBill = jest.fn(newBillInstance.updateBill);
      newBillInstance.updateBill = updateBill;

      // Remplir les champs du formulaire
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Taxi";
      screen.getByTestId("datepicker").value = "2024-10-18";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = "20";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Business trip";
      
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["image"], "image.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);  // Simuler la soumission du formulaire

      // Vérifier que updateBill a été appelé avec les bonnes données
      expect(updateBill).toHaveBeenCalled();
    });
  });

  //****************************** Test d'intégration : Erreur API lors de l'envoi des données */
  describe("When an API error occurs while submitting a new bill", () => {
    beforeEach(() => {
      // Simuler un utilisateur connecté
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "employee@test.com" }));

      // Charger le DOM de la page NewBill
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    test("It should display an error message when the API returns a 404 error", async () => {
      // Simuler l'erreur 404 lors de l'appel à la méthode store.bills.create
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 404"));
          }
        };
      });

      // Instancier la classe NewBill
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      // Remplir les champs du formulaire
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Taxi";
      screen.getByTestId("datepicker").value = "2024-10-18";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = "20";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Business trip";

      // Simuler l'ajout d'un fichier valide
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["image"], "image.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Simuler la soumission du formulaire
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Attendre que l'erreur 404 soit capturée
      await waitFor(() => expect(mockStore.bills().create).toHaveBeenCalled());

      // Vérifier que l'erreur 404 est bien gérée (par exemple, avec un message d'erreur dans la console)
      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 404"));
    });

    test("It should display an error message when the API returns a 500 error", async () => {
      // Simuler l'erreur 500 lors de l'appel à la méthode store.bills.create
      mockStore.bills.mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.reject(new Error("Erreur 500"));
          }
        };
      });

      // Instancier la classe NewBill
      const newBill = new NewBill({ document, onNavigate: jest.fn(), store: mockStore, localStorage: window.localStorage });

      // Remplir les champs du formulaire
      screen.getByTestId("expense-type").value = "Transports";
      screen.getByTestId("expense-name").value = "Taxi";
      screen.getByTestId("datepicker").value = "2024-10-18";
      screen.getByTestId("amount").value = "100";
      screen.getByTestId("vat").value = "20";
      screen.getByTestId("pct").value = "20";
      screen.getByTestId("commentary").value = "Business trip";

      // Simuler l'ajout d'un fichier valide
      const fileInput = screen.getByTestId("file");
      const validFile = new File(["image"], "image.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [validFile] } });

      // Simuler la soumission du formulaire
      const form = screen.getByTestId("form-new-bill");
      fireEvent.submit(form);

      // Attendre que l'erreur 500 soit capturée
      await waitFor(() => expect(mockStore.bills().create).toHaveBeenCalled());

      // Vérifier que l'erreur 500 est bien gérée (par exemple, avec un message d'erreur dans la console)
      expect(console.error).toHaveBeenCalledWith(new Error("Erreur 500"));
    });
  });
});
