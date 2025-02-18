import pathlib
import plotly.express as px
import pandas as pd
from typing import Literal, Dict, Any

from autogen import SwarmResult

from agent_builder.tools.analytical_functions import (
    categorize_spend,
    get_month_number,
    get_transaction_value,
    plot_charts,
    convert_month_to_year_month)


import os
import uuid


file_path = pathlib.Path(__file__).parents[2] / "data" / "fake_account_statement.csv"
image_path = pathlib.Path(__file__).parents[1] / "static" / "images"
# Load data



def load_data_update_context(context_variables: dict) -> SwarmResult:
    df = pd.read_csv(file_path)
    df = categorize_spend(df)

    df_string = df.to_dict('records')
    context_variables["data"] = df_string
    return SwarmResult(values="Data pulled from api", context_variables=context_variables)


def get_total_debit_transactions(context_variables: Dict[str, Any]) -> SwarmResult:
    """
    A function to get total debit transaction from the data
    :param data:
    :return:
    """
    data = context_variables["data"]
    df = pd.DataFrame(data)
    total_debit_transaction = get_transaction_value(df, "debit")
    context_variables["result"] = {"total_debit_transaction": float(total_debit_transaction)}
    return SwarmResult(values=f"Total debit transaction is {total_debit_transaction}",
                       context_variables=context_variables)


def get_closing_balance(context_variables: dict,
                        month: str | None = None,
                        reference_year: int = 2024, ) -> SwarmResult:
    """
    Compute the closing balance up to a given month.

    Parameters:
        context_variables (dict)
        month (str, optional): The target month in 'YYYY-MM' format.
                               If None, returns the closing balance of the last available month.
        reference_year (int): Default is 2024.

    Returns:
        float: The closing balance at the end of the specified month.
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    _df = df.copy()  # Avoid modifying the original dataframe
    _df["transaction_date"] = pd.to_datetime(_df["transaction_date"])
    _df['month'] = _df['transaction_date'].dt.to_period('M')  # Extract year-month
    _df['amount'] = _df.apply(lambda x: x['amount'] if x['type'] == 'credit' else -x['amount'],
                              axis=1)  # Adjust for debits

    closing_balances = _df.groupby('month')['amount'].sum().cumsum().reset_index()
    closing_balances['month'] = closing_balances['month'].astype(str)  # Convert to string for filtering
    print(f"closing balances : {closing_balances}")

    if month:
        reference_month = convert_month_to_year_month(month, reference_year)
        result = closing_balances.loc[closing_balances['month'] == reference_month, 'amount']
        final_result = result.iloc[0] if not result.empty else None  # Return balance or None if month not found
    else:
        final_result = closing_balances.iloc[-1]['amount']
    print(f"Final : {final_result}")
    # return round(final_result,4) # Return balance for the last available month
    result = f"The closing balance for month of {month} is {round(final_result, 4)}" if month else "The closing balance is {round(final_result,4)} "
    return SwarmResult(values=result, context_variables=context_variables)


def get_total_credit_transaction(context_variables: dict) -> float:
    """
    get total credit transactions done in the statement
    :param context_variables: Data on which closing balance would be calculated:
    :return: float
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    total_credit_transactions = get_transaction_value(df, "credit")
    return SwarmResult(values=f"The total credit transactions in statement is  {round(total_credit_transactions, 4)}",
                       context_variables=context_variables)


def get_total_transaction_for_month(context_variables: dict,
                                    month: str,
                                    transaction_type: Literal["credit", "debit", "net"],
                                    ) -> float:
    """

    :param context_variables: the data on which total transactions for a month would be calculated
    :param month: Month for which the transaction value would calculate
    :param transaction_type: whether debit or credit transactions
    :return:
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    month_number = get_month_number(month)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"])
    filtered_df = df[df["transaction_date"].dt.month == month_number]

    total_value = round(get_transaction_value(filtered_df, transaction_type), 4)
    if transaction_type == "credit":
        result = f"The total credit transactions in the statement for {month} is {total_value}"
    elif transaction_type == "debit":
        result = f"The total spend in the statement for {month} is {total_value}"
    else:
        result = f"The total net spend in the statement for {month} is {total_value}"

    return SwarmResult(values=result, context_variables=context_variables)


def get_recurring_expenses(context_variables: dict, min_months: int = 3) -> SwarmResult:
    """
    Identifies recurring expenses and plots a grouped bar chart showing the amount spent per expense in each month.

    Parameters:
    - data (dict): DataFrame containing bank transaction data.
    - min_months (int): Minimum number of months an expense must appear to be considered recurring.

    Returns:
    - List of recurring expense descriptions.
    - A Plotly grouped bar chart showing the monthly expense trends per recurring expense.
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors="coerce")
    df["year_month"] = df["transaction_date"].dt.to_period("M").astype(str)
    debit_df = df[df["type"] == "debit"]
    expense_counts = debit_df.groupby("narration")["year_month"].nunique()
    recurring_expenses = expense_counts[expense_counts >= min_months].index.tolist()
    recurring_df = debit_df[debit_df["narration"].isin(recurring_expenses)]
    expense_trends = recurring_df.groupby(["year_month", "narration"])["amount"].sum().reset_index()

    os.makedirs(image_path, exist_ok=True)
    file_name = f"{uuid.uuid4()}.png"
    file_path = os.path.join(image_path, file_name)
    print(f"File path : {file_path}")

    fig = px.bar(
        expense_trends,
        x="narration",
        y="amount",
        color="year_month",
        barmode="group",
        title="Grouped Bar Chart of Recurring Expenses per Month",
        labels={"narration": "Recurring Expense", "amount": "Amount Spent", "year_month": "Month"},
    )
    fig.update_layout(xaxis_tickangle=-45)
    fig.write_image(file_path)
    result = f"""
    The recurring expenses are : 
    {expense_trends.to_markdown()}

    Graph : {file_path}
    """
    return SwarmResult(values=result, context_variables=context_variables)


def aggregate_transactions(context_variables: dict,
                           group_by: Literal["category", "month"],
                           ) -> SwarmResult:
    """
    Aggregates expenses either by 'description' or by 'month'.

    Parameters:
    - data (dict): Data on which aggregation would be done
    - group_by (str): "description" to group by transaction description, "month" to group by month.
    - month_val : "parameter to see if we can group transaction description for a given month
    Returns:
    - dict: Aggregated expenses as a dictionary.
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    df = categorize_spend(df)
    # Ensure 'date' is in datetime format
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')

    # Filter only "debit" transactions (expenses)
    expense_df = df[df["type"] == "debit"]

    if group_by == "category":
        # Group by expense category (description)
        spend_data = expense_df.groupby("category")["amount"].sum().reset_index()
    elif group_by == "month":
        # Extract month name for grouping
        expense_df["month"] = expense_df["transaction_date"].dt.month_name()
        spend_data = expense_df.groupby("month")["amount"].sum().reset_index()

    result = f"""The agrregated transactions are: \n\n {spend_data.to_markdown()}"""

    return SwarmResult(values=result, context_variables=context_variables)


def plot_chart_categories(context_variables: dict,
                          chart_type: Literal["pie", "bar"] = "bar") -> SwarmResult:
    """
    Generates a spending chart (pie or bar) based on the category'.

    Parameters:
    - data (dict): data on which the chart is built
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    df = categorize_spend(df)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')
    expense_df = df[df["type"] == "debit"].copy()
    spend_data = expense_df.groupby("category")["amount"].sum().reset_index()
    x_axis, title = "category", "Spend by Category"
    final_image = plot_charts(spend_data, chart_type, image_path, x_axis, title)
    return SwarmResult(values=f"Chart showing spend across different categories:\n {final_image}",
                       context_variables=context_variables)


def plot_chart_month(context_variables: dict,
                     chart_type: Literal["pie", "bar"] = "bar") -> SwarmResult:
    """
    Generates a spending chart (pie or bar) based on the category'.

    Parameters:
    - data (dict): data on which chart is plotted
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    df = categorize_spend(df)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"])
    expense_df = df[df["type"] == "debit"]
    print(expense_df)
    expense_df["month"] = expense_df["transaction_date"].dt.month_name()
    print(expense_df)
    spend_data = expense_df.groupby("month")["amount"].sum().reset_index()
    x_axis, title = "month", "Spend by Month"

    final_image = plot_charts(spend_data, chart_type, image_path, x_axis, title)
    return SwarmResult(values=f"Chart showing spend across different months :\n {final_image}",
                       context_variables=context_variables)


def plot_chart_narration(
        context_variables: dict,
        filter_category: str,
        chart_type: Literal["pie", "bar"] = "bar") -> SwarmResult:
    """
    Generates a spending chart (pie or bar) based on the category'.

    Parameters:
    - data (dict): data on which the chart would be build
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """
    data = context_variables['data']
    df = pd.DataFrame(data)
    df = categorize_spend(df)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')
    expense_df = df[(df["type"] == "debit") & (df["category"] == filter_category)]
    spend_data = expense_df.groupby("narration")["amount"].sum().reset_index()
    x_axis, title = "narration", f"Spend by Description for Category : {filter_category}"

    final_image = plot_charts(spend_data, chart_type, image_path, x_axis, title)
    return SwarmResult(values=f"Chart showing spend split for {filter_category} :\n {final_image}",
                       context_variables=context_variables)


