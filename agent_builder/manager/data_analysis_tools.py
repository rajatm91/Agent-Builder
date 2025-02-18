from typing import Annotated, Literal
from typing import Annotated, Literal
from pandas import DataFrame
from autogen import SwarmResult
import pandas as pd
import os
import uuid
import plotly.express as px


def categorize_spend(df: pd.DataFrame) -> pd.DataFrame:
    # Define categories and keywords (substring-based matching)
    category_mapping = {
        "utilities": ["vodafone", "airtel", "bescom"],
        "quick commerce": ["blinkit", "swiggy instamart"],
        "restaurant": ["zomato", "swiggy dineout"],
        "travel": ["makemytrip", "easemytrip"],
        "electronics": ["croma", "reliance digital", "pai electronic"],
        "ecommerce": ["amazon", "myntra", "tata cliq"],
        "rent": ["rent"],
        "grocery": ["kirana"],
        "account transfer": ["acct trf"],
        "medical": ["onemg"],
        "saving": ["mutual fund"]
    }

    # Function to categorize each transaction
    def assign_category(description):
        description_lower = description.lower()
        for category, keywords in category_mapping.items():
            if any(keyword in description_lower for keyword in keywords):  # Substring check
                return category
        return "others"  # Default category for unmatched transactions

    # Apply categorization
    df["category"] = df["narration"].apply(assign_category)

    return df

def get_month_number(month_name: str) -> int:
    from datetime import datetime
    month_name = month_name.split(" ")[0]
    try:
        month_number = datetime.strptime(month_name.strip(), "%b").month
    except ValueError:
        month_number = datetime.strptime(month_name.strip(), "%B").month
    return month_number


def get_transaction_value(df: pd.DataFrame, transaction_type: Literal["debit","credit", "all" ] = "all" ,
                          col: str = "amount") -> float:
    match transaction_type:
        case "debit":
            d_transaction = df[df["type"] == "debit"]
            return round(d_transaction[col].sum(),4)
        case "credit":
            c_transaction = df[df["type"] == "credit"]
            return round(c_transaction[col].sum(), 4)
        case "all":
            df["net_amount"] = df.apply(lambda row: row[col] if row["type"] == "credit" else -row[col],
                                        axis=1)
            net_amount = df["net_amount"].sum()
            return round(net_amount, 4)


def convert_month_to_year_month(user_input: str, reference_year: int=2024) -> str:
    """
    Convert a month name or abbreviation to 'YYYY-MM' format.

    Parameters:
        user_input (str): Month name or abbreviation (e.g., 'Dec', 'December').
        reference_year (int, optional): Year to use, defaults to 2024.

    Returns:
        str: Formatted string in 'YYYY-MM' format.
    """
    from datetime import datetime
    try:
        # Parse month name to month number
        month_number = datetime.strptime(user_input, "%b").month  # Handles short names like 'Dec'
    except ValueError:
        try:
            month_number = datetime.strptime(user_input, "%B").month  # Handles full names like 'December'
        except ValueError:
            return None
    return f"{reference_year}-{month_number:02d}"


def plot_charts(df: pd.DataFrame,
               chart_type: Annotated[Literal["pie", "bar"], "Chart type"],
               image_path: str,
               x_axis: str, title: str
               ) -> str:
    """
    Generates a spending chart (pie or bar) based on expenses grouped by 'description' or 'month'.

    Parameters:
    - group_by (str): "category" for category-wise grouping, "month" for monthly grouping.
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """

    # Generate unique filename
    os.makedirs(image_path, exist_ok=True)
    file_name = f"{uuid.uuid4()}.png"
    file_path = os.path.join(image_path, file_name)
    print(f"File path : {file_path}")
    # Plot chart
    fig = px.pie(df, values="amount", names=x_axis, title=title) if chart_type == "pie" else px.bar(df, x=x_axis, y="amount", title=title)
    print(f"File path2 : {file_path}")
    # Save chart image
    fig.write_image(file_path)
    print(f"File path3 : {file_path}")

    return file_path

def get_total_debit_transactions(context_variables: dict) -> SwarmResult:
    data = context_variables["data"]
    df = pd.DataFrame(data)
    return get_transaction_value(df, "debit")


def get_closing_balance(context_variable: dict,
                        month: str | None=None,
                        reference_year: int= 2024) -> float:
    """
    Compute the closing balance up to a given month.

    Parameters:
        month (str, optional): The target month in 'YYYY-MM' format.
                               If None, returns the closing balance of the last available month.

    Returns:
        float: The closing balance at the end of the specified month.
    """
    data = context_variable['data']
    df = pd.DataFrame(data)
    _df = categorize_spend(df)

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
    return round(final_result,4) # Return balance for the last available month



def get_total_credit_transaction(context_variables: dict) -> float:
    return get_transaction_value(df, "credit")


def get_total_transaction_for_month(month: Annotated[str, "Month for transaction value to be calculate"],
                                    transaction_type: Annotated[Literal["credit", "debit","net"],
                                    "specify the type of transaction on which aggregation needs to be done"]) -> float:
    month_number = get_month_number(month)
    df["transaction_date"] = pd.to_datetime(df["transaction_date"])
    filtered_df = df[df["transaction_date"].dt.month == month_number]

    return get_transaction_value(filtered_df, transaction_type)


def get_recurring_expenses(min_months: int = 3) -> dict:
    """
    Identifies recurring expenses and plots a grouped bar chart showing the amount spent per expense in each month.

    Parameters:
    - df (pd.DataFrame): DataFrame containing bank transaction data.
    - min_months (int): Minimum number of months an expense must appear to be considered recurring.

    Returns:
    - List of recurring expense descriptions.
    - A Plotly grouped bar chart showing the monthly expense trends per recurring expense.
    """
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
    return { "expenses" : recurring_expenses, "image" : file_path }


def aggregate_transactions(group_by: Annotated[Literal["category", "month"], "Group by category"],
                           ) -> dict:
    """
    Aggregates expenses either by 'description' or by 'month'.

    Parameters:
    - group_by (str): "description" to group by transaction description, "month" to group by month.
    - month_val : "parameter to see if we can group transaction description for a given month
    Returns:
    - dict: Aggregated expenses as a dictionary.
    """

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

    return spend_data.to_dict()



def plot_chart_categories(chart_type: Annotated[Literal["pie", "bar"], "Chart type"] = "bar") -> dict:
    """
    Generates a spending chart (pie or bar) based on the category'.

    Parameters:
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')
    expense_df = df[df["type"] == "debit"].copy()
    spend_data = expense_df.groupby("category")["amount"].sum().reset_index()
    x_axis, title = "category", "Spend by Category"
    return plot_charts(spend_data, chart_type, image_path, x_axis, title)


def plot_chart_month(chart_type: Annotated[Literal["pie", "bar"], "Chart type"] = "bar") -> dict:
    """
    Generates a spending chart (pie or bar) based on the category'.

    Parameters:
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """
    df["transaction_date"] = pd.to_datetime(df["transaction_date"])
    expense_df = df[df["type"] == "debit"]
    print(expense_df)
    expense_df["month"] = expense_df["transaction_date"].dt.month_name()
    print(expense_df)
    spend_data = expense_df.groupby("month")["amount"].sum().reset_index()
    x_axis, title = "month", "Spend by Month"

    return plot_charts(spend_data,chart_type, image_path, x_axis, title)


def plot_chart_narration(filter_category: Annotated[str,
                "category based on which data needs to be filtered"],
               chart_type: Annotated[Literal["pie", "bar"], "Chart type"] = "bar") -> dict:
    """
    Generates a spending chart (pie or bar) based on the category'.

    Parameters:
    - chart_type (str): "pie" for a pie chart, "bar" for a bar chart.
    - image_path (str): Directory to save the generated chart image.

    Returns:
    - dict: Path of the saved chart image.
    """
    df["transaction_date"] = pd.to_datetime(df["transaction_date"], errors='coerce')
    print(f"df1: {df}")
    expense_df = df[(df["type"] == "debit") & (df["category"] == filter_category)]
    print(f"df2: {df}")
    spend_data = expense_df.groupby("narration")["amount"].sum().reset_index()
    print(f"df3 : {df}")
    x_axis, title = "narration", f"Spend by Description for Category : {filter_category}"


    return plot_charts(spend_data,chart_type, image_path, x_axis, title)


